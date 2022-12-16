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
import { erc20ABI } from '@/abis/erc20ABI'
import BN from 'bn.js'

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
  decimals?: string
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

export type TokenInfo = {
  type: LSPType
  address?: string
  name: string
  symbol: string
  decimals?: string
  balance?: number
}

const detectLSP = async (
  contractAddress: string,
  lspType: LSPType
): Promise<TokenInfo | undefined> => {
  if (lspType === LSPType.Unknown) {
    return undefined
  }

  const { contract: Contract } = useWeb3()
  // EIP-165 detection
  const contract = Contract(eip165ABI.concat(erc20ABI) as any, contractAddress)

  // Check if the contract implements the LSP interface ID
  let doesSupportInterface: boolean
  try {
    doesSupportInterface = await contract.methods
      .supportsInterface(lspTypeOptions[lspType].interfaceId)
      .call()
  } catch (error) {
    doesSupportInterface = false
    console.error(error)
  }
  if (!doesSupportInterface) {
    return undefined
  }

  try {
    const currentDecimals = await contract.methods.decimals().call()

    const _balance = await contract.methods
      .balanceOf(store['address'])
      .call()
      .catch(() => undefined)
    const balance = _balance
      ? new BN(_balance, 10)
          .div(new BN(10).pow(new BN(currentDecimals || '0', 10)))
          .toNumber()
      : 0

    // ERC725 detection
    const { getInstance } = useErc725()

    const erc725 = await getInstance(contractAddress)
    const [{ value: name }, { value: symbol }] = await erc725.fetchData([
      'LSP4TokenName',
      'LSP4TokenSymbol',
    ])
    if (typeof name !== 'string' || typeof symbol !== 'string') {
      throw new Error('Unable to get name and/or symbol')
    }
    return {
      type: lspType,
      name,
      symbol,
      address: contractAddress,
      balance,
      decimals: currentDecimals,
    }
  } catch (err) {
    console.error(err)
    return undefined
  }
}

export async function setState(
  key: keyof Store,
  newState: unknown
): Promise<void> {
  ;(store[key] as any) = newState
}

export function getTokensCreated(): string[] {
  let tokens: string[] = []
  const data = localStorage.getItem('up:createdTokens')
  if (!data) {
    localStorage.setItem('up:createdTokens', '[]')
  }
  try {
    tokens = JSON.parse(data || '[]')
  } catch (err) {
    // Ignore
  }
  return tokens
}

export function addTokenToLocalStore(address: string) {
  const tokens = getTokensCreated()
  const found = tokens.find(_address => _address === address)
  if (!found) {
    tokens.push(address)
    localStorage.setItem('createdTokens', JSON.stringify(tokens))
  }
}

export async function recalcTokens() {
  const { getInstance } = useErc725()

  const address = store['address']

  const result = await getInstance(address).fetchData('LSP5ReceivedAssets[]')
  const rawOwned = result.value as string[] //returns array of addresses
  const mapAssets: Record<string, boolean> = rawOwned.reduce<
    Record<string, boolean>
  >((all, address) => {
    all[address] = true
    return all
  }, {})
  const tokens = getTokensCreated()
  tokens.forEach(address => {
    mapAssets[address] = true
  })
  const ownedAssets = Object.keys(mapAssets)
  setState('assets', ownedAssets)

  const lsp7Tokens: TokenInfo[] = []
  const lsp8Tokens: TokenInfo[] = []

  //fetch the different assets types
  for (const address of ownedAssets) {
    const isLSP7 = await detectLSP(address, LSPType.LSP7DigitalAsset)
    if (isLSP7) {
      lsp7Tokens.push(isLSP7)
    }
    const isLSP8 = await detectLSP(
      address,
      LSPType.LSP8IdentifiableDigitalAsset
    )
    if (isLSP8) {
      lsp8Tokens.push(isLSP8)
    }
  }
  setState('lsp7', lsp7Tokens)
  setState('lsp8', lsp8Tokens)
}
export function useState(): {
  setConnected: (address: string, channel: Channel) => Promise<void>
  setDisconnected: () => void
  recalcTokens: () => Promise<void>
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

      recalcTokens()

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
      setState('lsp7', [])
      setState('lsp8', [])

      window.erc725Account = undefined
    },
    recalcTokens,
  }
}
