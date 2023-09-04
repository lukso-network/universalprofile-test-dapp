import EthereumProvider from '@walletconnect/ethereum-provider'
import { NETWORKS, WALLET_CONNECT_PROJECT_ID } from '@/helpers/config'

let provider: EthereumProvider

/**
 * Prepares a WalletConnect V2 provider (EthereumProvider) that manages the WebSocket connection.
 */
const setupWCV2Provider = async () => {
  provider = await EthereumProvider.init({
    projectId: WALLET_CONNECT_PROJECT_ID,
    chains: Object.entries(NETWORKS).map(net => net[1].chainId),
    methods: [
      'eth_getAccounts',
      'eth_getBalance',
      'eth_getId',
      'eth_personalSign',
      'eth_requestAccounts',
      'eth_sendTransaction',
      'eth_sign',
      'eth_signTransaction',
      'eth_signTypedData',
      'personal_sign',
      'up_addTransactionRelayer',
      'up_import',
      'wallet_addEthereumChain',
      'wallet_switchEthereumChain',
    ],
    metadata: {
      name: 'UP Test DApp',
      description: 'UP Test DApp',
      url: document.location.origin,
      icons: [document.location.origin + '/lukso.png'],
    },
    rpcMap: {
      42: 'https://rpc.mainnet.lukso.network',
      2828: 'https://rpc.l16.lukso.network',
      4201: 'https://rpc.testnet.lukso.network',
    },
    showQrModal: true,
    optionalChains: [0],
  })
  await provider.connect()
  return provider
}

/**
 * Disconnects from all sessions.
 */
const resetWCV2Provider = async (): Promise<void> => {
  if (provider) {
    try {
      await provider.disconnect()
    } catch (error) {
      console.warn(`WalletConnect V2 disconnection error: ${error}`)
    }
  } else {
    console.warn(
      'Provider is not set up. Please, call `setupWCV2Provider` first.'
    )
  }
}

/**
 * Starting a new pairing attempt by opening a modal with a QR code.
 */
const openWCV2Modal = async (): Promise<void> => {
  if (provider) {
    try {
      await provider.connect()
    } catch (error) {
      console.warn(`WalletConnect V2 connection error: ${error}`)
    }
  } else {
    console.warn(
      'Provider is not set up. Please, call `setupWCV2Provider` first.'
    )
  }
}

/**
 * @returns an instance managing WalletConnect V2 connection.
 */
const getWCV2Provider = (): EthereumProvider => {
  return provider
}

/**
 * @returns a set of functions to manage WalletConnect V2 connection.
 */
export default function useWalletConnectV2(): {
  resetWCV2Provider: () => Promise<void>
  setupWCV2Provider: () => Promise<EthereumProvider>
  openWCV2Modal: () => Promise<void>
  getWCV2Provider: () => EthereumProvider
} {
  return {
    resetWCV2Provider,
    setupWCV2Provider,
    openWCV2Modal,
    getWCV2Provider,
  }
}
