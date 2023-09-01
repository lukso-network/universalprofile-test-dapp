import BN from 'bn.js'
import { ERC725JSONSchema } from '@erc725/erc725.js'
import { INTERFACE_IDS } from '@lukso/lsp-smart-contracts'
import lsp3Schema from '@erc725/erc725.js/schemas/LSP3UniversalProfileMetadata.json'
import lsp4Schema from '@erc725/erc725.js/schemas/LSP4DigitalAsset.json'
import lsp9Schema from '@erc725/erc725.js/schemas/LSP9Vault.json'
import useErc725 from '@/compositions/useErc725'
import { eip165ABI } from '@/abis/eip165ABI'
import { erc20ABI } from '@/abis/erc20ABI'
import { store, setState } from '@/stores/index'
import { getSelectedNetworkConfig } from '@/helpers/config'
import useWeb3Connection from '@/compositions/useWeb3Connection'

const { lsp7TokenDivisible, lsp7TokenNonDivisible } = getSelectedNetworkConfig()

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
  ERROR_TEST = 'ERROR_TEST',
}

interface LspTypeOption {
  interfaceId: string // EIP-165
  lsp2Schema: ERC725JSONSchema | null
  decimals?: string
}

export const lspTypeOptions: Record<
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
  [LSPType.ERROR_TEST]: {
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

export const detectLSP = async (
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

  const { contract: Contract } = useWeb3Connection()
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
    let [{ value: name }, { value: symbol }] = await erc725.fetchData([
      'LSP4TokenName',
      'LSP4TokenSymbol',
    ])
    if (typeof name !== 'string') {
      try {
        name = (await contract.methods.name().call()) as string
      } catch (err) {
        name = '<undef>'
      }
    }
    if (typeof symbol !== 'string') {
      try {
        symbol = (await contract.methods.symbol().call()) as string
      } catch (err) {
        symbol = '<undef>'
      }
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
    localStorage?.setItem(
      'up:tokens',
      JSON.stringify({
        assets: Object.keys(mapAssets),
        lsp7: lsp7Tokens,
        lsp8: lsp8Tokens,
      })
    )
  } catch (err) {
    // There are going to be errors here during unit tests
    // because we're not mocking the whole deployment of the UP
  }
}
