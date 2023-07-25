import { NetworkInfo, NetworkType } from '@/interfaces/network'

export const UP_CONNECTED_ADDRESS = 'up:connected-address'

export const DEFAULT_GAS = 5_000_000
export const DEFAULT_GAS_PRICE = '10000000000'

export const MAGICVALUE = '0x1626ba7e'

export const DEFAULT_NETWORK: NetworkType = 'testnet'

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
      url: 'https://explorer.testnet.lukso.network',
    },
    chainId: 4201,

    // The sample values are currently just junk.
    sampleEoA: '0x21F35075133853155758cf9C37c6A993Ca8C596e',
    sampleUP: '0x880f6ce8d2b0d7322BA0CEB2aefe8D2C2D3e8E58',
    sampleSC: '0x3F89A607EebAB914a51b11bfc06c7aDEE7915C18',
    // ERC20
    erc20TokenWithEip165: '0xF5443372766a48faF098244c8C769c5AEa02f321',
    erc20TokenWithoutEip165: '0xB29c50a9F3D90FA3aDF394f2960BD6D8e0Ff5E9D',
    // ERC777
    erc777TokenWithEip165: '0xC719f454C8F9a0C7eEC4203B21766B88d8a5B073',
    erc777TokenWithoutEip165: '0xD7549C70A6122cA01043831f0f0c65152C4877d6',
    // LSP7
    lsp7TokenDivisible: '0x28682Ff854Cb885eB690780f794CD632D94289B8',
    lsp7TokenNonDivisible: '0xF5d8FD6599Cb1971b8EEba218FFE31da34a257a9',
    // ERC721
    erc721TokenWithEip165: '0x57b8e4f3C96180088652dc361473bB91266bb080',
  },
}

export const PRIVATE_KEY =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'

export let DEFAULT_NETWORK_CONFIG = NETWORKS[DEFAULT_NETWORK]
export function setNetworkConfig(inChainId: number): void {
  const network = Object.entries(NETWORKS).find(
    ([, { chainId }]) => chainId === inChainId
  )
  if (network) {
    DEFAULT_NETWORK_CONFIG = NETWORKS[network[0] as NetworkType]
  } else {
    console.warn('Unknown network defaulting to l16')
    DEFAULT_NETWORK_CONFIG = NETWORKS['l16']
  }
}

export const SIGNATURE_LOOKUP_URL =
  'https://4bytesdictionary.universalprofile.cloud'

export const WALLET_CONNECT_PROJECT_ID = '4f90c247328c3e3fed9d514f92b2fdce' // We should put this in .env
