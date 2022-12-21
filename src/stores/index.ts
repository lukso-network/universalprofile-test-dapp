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
  UP = 'UP',
  SC = 'SC',
  EoA = 'EoA',
  ERC20 = 'ERC20',
  ERC777 = 'ERC777',
  ERC721 = 'ERC721',
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
  [LSPType.EoA]: {
    interfaceId: '',
    lsp2Schema: null,
  },
  [LSPType.UP]: {
    interfaceId: '',
    lsp2Schema: null,
  },
  [LSPType.SC]: {
    interfaceId: '',
    lsp2Schema: null,
  },
  [LSPType.ERC20]: {
    interfaceId: '',
    lsp2Schema: null,
  },
  [LSPType.ERC777]: {
    interfaceId: '',
    lsp2Schema: null,
  },
  [LSPType.ERC721]: {
    interfaceId: '',
    lsp2Schema: null,
  },
}

export type TokenInfo = {
  type: LSPType
  address?: string
  name?: string
  symbol?: string
  decimals?: string
  balance?: number
  label?: string
}

const detectLSP = async (
  contractAddress: string,
  lspType: Exclude<LSPType, LSPType.Unknown>,
  owned = false
): Promise<TokenInfo | undefined> => {
  if (
    lspType in
    {
      [LSPType.Unknown]: true,
      [LSPType.EoA]: true,
      [LSPType.SC]: true,
      [LSPType.UP]: true,
    }
  ) {
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
  }
  if (!doesSupportInterface) {
    return undefined
  }

  try {
    let currentDecimals = '0'
    let balance = owned ? 1 : 0
    try {
      currentDecimals = await contract.methods.decimals().call()

      if (currentDecimals !== '0') {
        const _balance = await contract.methods
          .balanceOf(store['address'])
          .call()
          .catch(() => undefined)
        balance = _balance
          ? new BN(_balance, 10)
              .div(new BN(10).pow(new BN(currentDecimals || '0', 10)))
              .toNumber()
          : 0
      }
    } catch (err) {
      console.error(contractAddress, lspType, err, 'no balance')
    }
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
    let shortType: string = lspType
    switch (shortType) {
      case LSPType.LSP7DigitalAsset:
        shortType = 'LSP7'
        break
      case LSPType.LSP8IdentifiableDigitalAsset:
        shortType = 'LSP8'
        break
      case LSPType.LSP3UniversalProfileMetadata:
        shortType = 'LSP3'
        break
      case LSPType.LSP9Vault:
        shortType = 'LSP9'
        break
    }
    console.log('success', contractAddress, lspType)
    return {
      type: lspType,
      name,
      symbol,
      address: contractAddress,
      balance,
      decimals: currentDecimals,
      label: `${shortType} ${name} (${symbol}) ${contractAddress.substring(
        0,
        10
      )}...`,
    }
  } catch (err) {
    console.error(contractAddress, lspType, err)
    return undefined
  }
}

export const sampleEoA = '0x311611C9A46a192C14Ea993159a0498EDE5578aC'
export const sampleUP = '0xe608aBEeB2EA0EBb59170de6CBcFFaE06437fE0c'
export const sampleSC = '0xcAC51571007DaAB53f26C2387b3B16420491dE18'
// ERC20
export const erc20TokenWithEip165 = '0xF5443372766a48faF098244c8C769c5AEa02f321'
export const erc20TokenWithoutEip165 =
  '0xB29c50a9F3D90FA3aDF394f2960BD6D8e0Ff5E9D'
// ERC777
export const erc777TokenWithEip165 =
  '0xC719f454C8F9a0C7eEC4203B21766B88d8a5B073'
export const erc777TokenWithoutEip165 =
  '0xD7549C70A6122cA01043831f0f0c65152C4877d6'
// LSP7
export const lsp7TokenDivisible = '0x314E7a56B08AF8E729612930dBAd70BB5A3575D9'
export const lsp7TokenNonDivisible =
  '0xF5d8FD6599Cb1971b8EEba218FFE31da34a257a9'
// ERC721
export const erc721TokenWithEip165 =
  '0x57b8e4f3C96180088652dc361473bB91266bb080'

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
    localStorage.setItem('up:createdTokens', JSON.stringify(tokens))
  }
}

export async function recalcTokens() {
  const { getInstance } = useErc725()

  const address = store['address']
  if (!address) {
    return
  }

  try {
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
      if (!(address in mapAssets)) {
        mapAssets[address] = false
      }
    })
    if (!(lsp7TokenDivisible in mapAssets)) {
      mapAssets[lsp7TokenDivisible] = false
    }
    if (!(lsp7TokenNonDivisible in mapAssets)) {
      mapAssets[lsp7TokenNonDivisible] = false
    }
    setState('assets', Object.keys(mapAssets))

    const lsp7Tokens: TokenInfo[] = []
    const lsp8Tokens: TokenInfo[] = []

    //fetch the different assets types
    for (const [address, owned] of Object.entries(mapAssets)) {
      const isLSP7 = await detectLSP(address, LSPType.LSP7DigitalAsset, owned)
      if (isLSP7) {
        lsp7Tokens.push(isLSP7)
      }
      const isLSP8 = await detectLSP(
        address,
        LSPType.LSP8IdentifiableDigitalAsset,
        owned
      )
      if (isLSP8) {
        lsp8Tokens.push(isLSP8)
      }
    }
    setState('lsp7', lsp7Tokens)
    setState('lsp8', lsp8Tokens)
  } catch (err) {
    // There are going to be errors here during unit tests
    // because we're not mocking the whole deployment of the UP
  }
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
      // check for balance needs to be last as Wallet Connect doesn't support `eth_getBalance` method
      setState('balance', await getBalance(address))

      await recalcTokens()
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
