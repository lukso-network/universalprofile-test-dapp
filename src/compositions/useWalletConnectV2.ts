import EthereumProvider from '@walletconnect/ethereum-provider'
import { setState, useState, getState } from '@/stores'
import useWeb3 from '@/compositions/useWeb3'
import { provider as Provider } from 'web3-core'
import {
  DEFAULT_NETWORK_CONFIG,
  WALLET_CONNECT,
  WALLET_CONNECT_PROJECT_ID,
} from '@/helpers/config'

let provider: EthereumProvider

/**
 * Prepares a WalletConnect V2 provider (EthereumProvider) that manages the WebSocket connection.
 */
const setupWCV2Provider = async (): Promise<void> => {
  const { setupWeb3 } = useWeb3()
  provider = await EthereumProvider.init({
    projectId: WALLET_CONNECT_PROJECT_ID,
    chains: [DEFAULT_NETWORK_CONFIG.chainId],
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
  })

  provider.on('disconnect', (error: any) => {
    if (error) {
      throw error
    }

    setupWeb3(provider as unknown as Provider)
    setState('isConnected', true)
  })

  provider.on('accountsChanged', async (accounts: string[]) => {
    console.log('Account changed', accounts)

    if (accounts.length === 0 && getState('isConnected')) {
      await resetWCV2Provider()
    }

    const { setConnected } = useState()
    const [address] = accounts

    setConnected(address, WALLET_CONNECT)
  })

  provider.on('connect', (error: any) => {
    if (error) {
      throw error
    }

    setupWeb3(provider as unknown as Provider)
    setState('isConnected', true)
  })

  provider.on('accountsChanged', async (accounts: string[]) => {
    console.log('Account changed', accounts)

    if (accounts.length === 0 && getState('isConnected')) {
      await resetWCV2Provider()
    }

    const { setConnected } = useState()
    const [address] = accounts

    setConnected(address, WALLET_CONNECT)
  })

  setupWeb3(provider as unknown as Provider)

  const { setConnected } = useState()
  const [address] = provider.accounts
  if (address) {
    setConnected(address, WALLET_CONNECT)
  }
}

/**
 * Disconnects from all sessions.
 */
const resetWCV2Provider = async (): Promise<void> => {
  if (provider) {
    await provider.disconnect()
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
    await provider.connect()
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
 * Custom RPC requests cannot be handled by `window.ethereum.request(request)` and thus must be forwarded to
 * `provider.request` for a custom processing.
 */
const sendCustomWCV2Request = async (request: {
  method: string
  params?: [any]
}): Promise<any> => {
  if (provider && provider.connected) {
    return await provider.request(request)
  } else {
    console.warn('Provider is not set up or not connected.')
  }
}

/**
 * @returns a set of functions to manage WalletConnect V2 connection.
 */
export default function useWalletConnectV2(): {
  resetWCV2Provider: () => Promise<void>
  setupWCV2Provider: () => Promise<void>
  openWCV2Modal: () => Promise<void>
  getWCV2Provider: () => EthereumProvider
  sendCustomWCV2Request: (request: {
    method: string
    params?: [any]
  }) => Promise<any>
} {
  return {
    resetWCV2Provider,
    setupWCV2Provider,
    openWCV2Modal,
    getWCV2Provider,
    sendCustomWCV2Request,
  }
}
