import { NetworkInfo, NetworkType } from '@/interfaces/network'

export const UP_CONNECTED_ADDRESS = 'up:connected-address'
/**
 * Tells what was used to establish currently available connection, if any:
 * - WalletConnect (for mobile, extension or desktop app);
 * - or injected `window.ethereum` object for extension only.
 *
 * Note: wallet connect can be used for extension, mobile and desktop applications as well.
 * Thus, we do not check what DApp is connected to but rather what tool was used to connect
 * so that we can recreate the connection correctly.
 */
export const MEANS_OF_CONNECTION = 'means-of-connection'
export const WALLET_CONNECT = 'wallet-connect-v2'
export const WINDOW_LUKSO = 'window-lukso'
export const WEB3_ONBOARD = 'web3Onboard'

export const DEFAULT_GAS = 5_000_000
export const DEFAULT_GAS_PRICE = '10000000000'

export const MAGICVALUE = '0x1626ba7e'

const DEFAULT_NETWORK: NetworkType = 'testnet'
const SELECTED_NETWORK_KEY = 'selected-network'

export const NETWORKS: { [K in NetworkType]: NetworkInfo } = {
  l16: {
    name: 'l16',
    rpc: {
      url: 'https://rpc.l16.lukso.network',
    },
    cache: {
      url: 'https://erc725cache.l16.lukso.network/graphql',
    },
    ipfs: {
      url: 'https://2eff.lukso.dev/ipfs/',
    },
    blockscout: {
      url: 'https://explorer.execution.l16.lukso.network',
    },
    chainId: 2828,

    sampleEoA: '0x311611C9A46a192C14Ea993159a0498EDE5578aC',
    sampleUP: '0x8A6735585B824401CaB08D7c92FcdFB4b143256E',
    sampleSC: '0xcAC51571007DaAB53f26C2387b3B16420491dE18',
    errorContract: '0xFDb952E4dC30A1C55F76cdC2Ca14c13cFb69E62c',
    // ERC20
    erc20TokenWithEip165: '0xF5443372766a48faF098244c8C769c5AEa02f321',
    erc20TokenWithoutEip165: '0xB29c50a9F3D90FA3aDF394f2960BD6D8e0Ff5E9D',
    // ERC777
    erc777TokenWithEip165: '0xC719f454C8F9a0C7eEC4203B21766B88d8a5B073',
    erc777TokenWithoutEip165: '0xD7549C70A6122cA01043831f0f0c65152C4877d6',
    // LSP7
    lsp7TokenDivisible: '0x314E7a56B08AF8E729612930dBAd70BB5A3575D9',
    lsp7TokenNonDivisible: '0xF5d8FD6599Cb1971b8EEba218FFE31da34a257a9',
    // ERC721
    erc721TokenWithEip165: '0x57b8e4f3C96180088652dc361473bB91266bb080',
  },
  testnet: {
    name: 'testnet',
    rpc: {
      url: 'https://rpc.testnet.lukso.network',
    },
    cache: {
      url: 'https://erc725cache.testnet.lukso.network/graphql',
    },
    ipfs: {
      url: 'https://2eff.lukso.dev/ipfs/',
    },
    blockscout: {
      url: 'https://explorer.execution.testnet.lukso.network',
    },
    chainId: 4201,

    // The sample values are currently just junk.
    sampleEoA: '0xD634fc59DE7fCb60677322B2B114Ab70756e70be',
    sampleUP: '0x21CFF5BCe6F7845734fCC3915FEeaC7C7D89588D',
    sampleSC: '0xb4c93158DDC3043D4Cd8270d6fDC3232ba21eD32',
    errorContract: '0xFDb952E4dC30A1C55F76cdC2Ca14c13cFb69E62c',
    // ERC20
    erc20TokenWithEip165: '0xb4c93158DDC3043D4Cd8270d6fDC3232ba21eD32',
    erc20TokenWithoutEip165: '0xB29c50a9F3D90FA3aDF394f2960BD6D8e0Ff5E9D',
    // ERC777
    erc777TokenWithEip165: '0xC719f454C8F9a0C7eEC4203B21766B88d8a5B073',
    erc777TokenWithoutEip165: '0xD7549C70A6122cA01043831f0f0c65152C4877d6',
    // LSP7
    lsp7TokenDivisible: '0x28682Ff854Cb885eB690780f794CD632D94289B8',
    lsp7TokenNonDivisible: '0x085E969a80e374E9627CceC9630e030b1EDdC42b',
    // ERC721
    erc721TokenWithEip165: '0x57b8e4f3C96180088652dc361473bB91266bb080',
  },
}

export const PRIVATE_KEY =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'

export function setNetworkConfig(inChainId: number): void {
  const network = Object.entries(NETWORKS).find(
    ([, { chainId }]) => chainId === inChainId
  )
  let networkKey
  if (network) {
    networkKey = network[1].name
  } else {
    console.warn(`Unknown network. Defaulting to '${DEFAULT_NETWORK}'.`)
    networkKey = DEFAULT_NETWORK
  }
  localStorage.setItem(SELECTED_NETWORK_KEY, networkKey)
}

export function resetNetworkConfig(): void {
  localStorage.setItem(SELECTED_NETWORK_KEY, DEFAULT_NETWORK)
}

export function getSelectedNetworkType(): NetworkType {
  const selectedNetwork = localStorage.getItem(
    SELECTED_NETWORK_KEY
  ) as NetworkType
  if (selectedNetwork) {
    return selectedNetwork
  } else {
    return DEFAULT_NETWORK
  }
}

export function getSelectedNetworkConfig(): NetworkInfo {
  return NETWORKS[getSelectedNetworkType()]
}

export const SIGNATURE_LOOKUP_URL =
  'https://4bytesdictionary.universalprofile.cloud'

export const WALLET_CONNECT_PROJECT_ID = '4f90c247328c3e3fed9d514f92b2fdce' // We should put this in .env
