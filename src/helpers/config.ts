import { NetworkInfo, NetworkType } from '@/interfaces/network'

export const UP_CONNECTED_ADDRESS = 'up:connected-address'

export const DEFAULT_GAS = 5_000_000
export const DEFAULT_GAS_PRICE = '10000000000'

export const MAGICVALUE = '0x1626ba7e'

export const DEFAULT_NETWORK: NetworkType = 'l16'

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
    sampleUP: '0xe608aBEeB2EA0EBb59170de6CBcFFaE06437fE0c',
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
}

export const PRIVATE_KEY =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'

export const DEFAULT_NETWORK_CONFIG = NETWORKS[DEFAULT_NETWORK]

export const SIGNATURE_LOOKUP_URL =
  'https://dawn-band-b9c5.andreas3255.workers.dev/'

export const WALLET_CONNECT_PROJECT_ID = '60d33cf1d49c401142281758795f53d9' // We should put this in .env
;('https://4bytesdictionary.universalprofile.cloud/')
