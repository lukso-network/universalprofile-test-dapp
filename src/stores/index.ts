import { reactive } from 'vue'
import { Store, Channel } from '@/types'
import useWeb3 from '@/compositions/useWeb3'
import { DEFAULT_GAS, DEFAULT_GAS_PRICE } from '@/helpers/config'
import UniversalProfile from '@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json'
import KeyManager from '@lukso/lsp-smart-contracts/artifacts/LSP6KeyManager.json'
import useErc725 from '@/compositions/useErc725'
import {
  INTERFACE_IDS,
  // @ts-ignore
} from '@lukso/lsp-smart-contracts/constants.js'
import { ERC725JSONSchema } from '@erc725/erc725.js'
import lsp3Schema from '@erc725/erc725.js/schemas/LSP3UniversalProfileMetadata.json'
import lsp4Schema from '@erc725/erc725.js/schemas/LSP4DigitalAsset.json'
import lsp9Schema from '@erc725/erc725.js/schemas/LSP9Vault.json'
import { eip165ABI } from '../abis/eip165ABI'

export const store = reactive<Store>({
  isConnected: false,
  address: '',
  chainId: 0,
  balance: 0,
  channel: undefined,
  tokenAddress: undefined,
  assets: [],
  lsp7: [],
  lsp8: [],
})

window.store = store

export const getState: (key: keyof Store) => any = key => {
  return store[key]
}

const getSupportedStandardObject = (schemas: ERC725JSONSchema[]) => {
  try {
    const results = schemas.filter(schema => {
      return schema.name.startsWith('SupportedStandards:')
    })

    if (results.length === 0) {
      return null
    }

    return results[0]
  } catch (error) {
    return null
  }
}

export enum LSPType {
  LSP3UniversalProfileMetadata = 'LSP3UniversalProfileMetadata',
  LSP7DigitalAsset = 'LSP7DigitalAsset',
  LSP8IdentifiableDigitalAsset = 'LSP8IdentifiableDigitalAsset',
  LSP9Vault = 'LSP9Vault',
  Unknown = 'Unknown',
}

interface LspTypeOption {
  interfaceId: string // EIP-165
  lsp2Schema: ERC725JSONSchema | null
}

const lspTypeOptions: Record<
  Exclude<LSPType, LSPType.Unknown>,
  LspTypeOption
> = {
  [LSPType.LSP3UniversalProfileMetadata]: {
    interfaceId: INTERFACE_IDS.LSP0ERC725Account,
    lsp2Schema: getSupportedStandardObject(lsp3Schema as ERC725JSONSchema[]),
  },
  [LSPType.LSP7DigitalAsset]: {
    interfaceId: INTERFACE_IDS.LSP7DigitalAsset,
    lsp2Schema: getSupportedStandardObject(lsp4Schema as ERC725JSONSchema[]),
  },
  [LSPType.LSP8IdentifiableDigitalAsset]: {
    interfaceId: INTERFACE_IDS.LSP8IdentifiableDigitalAsset,
    lsp2Schema: getSupportedStandardObject(lsp4Schema as ERC725JSONSchema[]),
  },
  [LSPType.LSP9Vault]: {
    interfaceId: INTERFACE_IDS.LSP9Vault,
    lsp2Schema: getSupportedStandardObject(lsp9Schema as ERC725JSONSchema[]),
  },
}

const detectLSP = async (contractAddress: string, lspType: LSPType) => {
  if (lspType === LSPType.Unknown) {
    return false
  }

  const { contract: Contract } = useWeb3()
  // EIP-165 detection
  const contract = Contract(eip165ABI as any, contractAddress)

  // Check if the contract implements the LSP interface ID
  let doesSupportInterface: boolean
  try {
    doesSupportInterface = await contract.methods.supportsInterface(
      lspTypeOptions[lspType].interfaceId
    )
    console.log(
      contractAddress,
      (doesSupportInterface ? 'does support ' : 'does not support ') +
        lspTypeOptions[lspType].interfaceId
    )
  } catch (error) {
    doesSupportInterface = false
    console.error(error)
  }

  const lsp2Schema = lspTypeOptions[lspType].lsp2Schema

  if (!lsp2Schema) {
    return doesSupportInterface
  }

  // ERC725 detection
  const { getInstance } = useErc725()

  const erc725 = await getInstance(contractAddress)

  try {
    const lspSupportedStandards = await erc725.fetchData(lsp2Schema.name)
    return lspSupportedStandards.value === lsp2Schema.valueContent
  } catch (error) {
    console.error(error)
    return false
  }
}

export async function setState(
  key: keyof Store,
  newState: unknown
): Promise<void> {
  ;(store[key] as any) = newState
}

export function useState(): {
  setConnected: (address: string, channel: Channel) => Promise<void>
  setDisconnected: () => void
} {
  return {
    setConnected: async (address: string, channel: Channel) => {
      const { getChainId, getBalance, contract } = useWeb3()

      setState('address', address)
      setState('isConnected', true)
      setState('channel', channel)
      setState('chainId', await getChainId())

      window.erc725Account = contract(UniversalProfile.abi as any, address, {
        gasPrice: DEFAULT_GAS_PRICE,
        gas: DEFAULT_GAS,
      })

      const upOwner = await window.erc725Account.methods.owner().call()
      window.keyManager = contract(KeyManager.abi as any, upOwner, {
        gas: DEFAULT_GAS,
        gasPrice: DEFAULT_GAS_PRICE,
      })

      const { getInstance } = useErc725()

      const result = await getInstance(address).fetchData(
        'LSP5ReceivedAssets[]'
      )
      const ownedAssets = result.value as string[] //returns array of addresses
      console.log('assets', ownedAssets)
      setState('assets', ownedAssets)

      const lsp7AddressesTemp: string[] = []
      const lsp8AddressesTemp: string[] = []

      //fetch the different assets types
      for (const address of ownedAssets) {
        const isLSP7 = await detectLSP(address, LSPType.LSP7DigitalAsset)

        const isLSP8 = await detectLSP(
          address,
          LSPType.LSP8IdentifiableDigitalAsset
        )

        if (isLSP7 && !isLSP8) {
          lsp7AddressesTemp.push(address)
        } else if (isLSP8 && !isLSP7) {
          lsp8AddressesTemp.push(address)
        } else {
          console.log('asset is not an LSP')
        }
      }

      setState('lsp7', lsp7AddressesTemp)
      setState('lsp8', lsp8AddressesTemp)

      // check for balance needs to be last as Wallet Connect doesn't support `eth_getBalance` method
      setState('balance', await getBalance(address))
    },
    setDisconnected: () => {
      setState('address', '')
      setState('isConnected', false)
      setState('channel', undefined)
      setState('chainId', 0)
      setState('balance', 0)
      setState('assets', [])

      window.erc725Account = undefined
    },
  }
}
