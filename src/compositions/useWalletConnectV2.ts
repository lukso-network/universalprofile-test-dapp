import EthereumProvider from '@walletconnect/ethereum-provider'
import { setState, useState, getState } from '@/stores'
import useWeb3 from '@/compositions/useWeb3'
import { provider as Provider } from 'web3-core'
import { DEFAULT_NETWORK_CONFIG } from '@/helpers/config'

let provider: EthereumProvider

/**
 * Prepares a WalletConnect V2 provider (EthereumProvider) that manages the WebSocket connection.
 */
const setupWCV2Provider = async (): Promise<void> => {
  const { setupWeb3 } = useWeb3()

  provider = await EthereumProvider.init({
    projectId: '969ebd167fcb13001839a2d41a7f7170',
    chains: [DEFAULT_NETWORK_CONFIG.chainId],
    methods: [
      'eth_sendTransaction',
      'eth_sign',
      'personal_sign',
      'eth_getBalance',
      'eth_getAccounts',
      'eth_requestAccounts',
      'up_import',
      'up_addTransactionRelayer',
    ],
    metadata: {
      name: 'UP Test DApp',
      description: 'UP Test DApp',
      url: 'https://up-test-dapp.lukso.tech/',
      icons: ['https://up-test-dapp.lukso.tech/lukso.png'],
    },
  })

  provider.on('disconnect', (error: any) => {
    if (error) {
      throw error
    }

    setState('isConnected', true)
    setupWeb3(provider as unknown as Provider)
  })

  provider.on('connect', (error: any) => {
    if (error) {
      throw error
    }

    setState('isConnected', true)
    // setupWeb3(provider as unknown as Provider)
  })

  provider.on('accountsChanged', async (accounts: string[]) => {
    console.log('Account changed', accounts)

    if (accounts.length === 0 && getState('isConnected')) {
      // await resetProvider()
    }

    const { setConnected } = useState()
    const [address] = accounts

    setConnected(address, 'walletConnectV2')
  })

  provider.on('connect', (error: any) => {
    if (error) {
      throw error
    }

    setState('isConnected', true)
    setupWeb3(provider as unknown as Provider)
  })

  provider.on('accountsChanged', async (accounts: string[]) => {
    console.log('Account changed', accounts)

    if (accounts.length === 0 && getState('isConnected')) {
      await resetWCV2Provider()
    }

    const { setConnected } = useState()
    const [address] = accounts

    setConnected(address, 'walletConnectV2')
  })

  setupWeb3(provider as unknown as Provider)
}

/**
 * Disconnects from all sessions. 
 */
const resetWCV2Provider = async (): Promise<void> => {
  if (provider) {
    await provider.disconnect()
  } else {
    console.warn("Provider is not set up. Please, call `setupWCV2Provider` first.")
  }
}

/**
 * Starting a pairing attempt by opening a modal with a QR code.
 */
const enableWCV2Provider = async (): Promise<void> => {
  if (provider) {
    await provider.connect()
  } else {
    console.warn("Provider is not set up. Please, call `setupWCV2Provider` first.")
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
  setupWCV2Provider: () => Promise<void>
  enableWCV2Provider: () => Promise<void>
  getWCV2Provider: () => EthereumProvider
  // sendCustomWCRequest: (request: object) => Promise<any>
} {
  return {
    resetWCV2Provider,
    setupWCV2Provider,
    enableWCV2Provider,
    getWCV2Provider,
    // sendCustomWCRequest,
  }
}
