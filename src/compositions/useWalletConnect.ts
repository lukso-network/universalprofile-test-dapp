import WalletConnectProvider from '@walletconnect/web3-provider'
import { setState, useState, getState } from '@/stores'
import useWeb3 from '@/compositions/useWeb3'
import { provider as Provider } from 'web3-core'
import { DEFAULT_NETWORK_CONFIG } from '@/helpers/config'

let provider: WalletConnectProvider
export const WALLET_CONNECT_VERSION = '1.0'

const setupProvider = async (): Promise<void> => {
  const { setupWeb3 } = useWeb3()

  provider = new WalletConnectProvider({
    rpc: {
      [DEFAULT_NETWORK_CONFIG.chainId]: DEFAULT_NETWORK_CONFIG.rpc.url,
    },
    bridge: 'https://safe-walletconnect.safe.global/',
    chainId: DEFAULT_NETWORK_CONFIG.chainId,
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
      await resetProvider()
    }

    const { setConnected } = useState()
    const [address] = accounts

    setConnected(address, 'walletConnect')
  })

  setupWeb3(provider as unknown as Provider)
}

const resetProvider = async (): Promise<void> => {
  await provider.disconnect()
}

const enableProvider = async (): Promise<void> => {
  await provider.enable()
}

const getProvider = (): WalletConnectProvider => {
  return provider
}

export default function useWalletConnect(): {
  resetProvider: () => Promise<void>
  setupProvider: () => Promise<void>
  enableProvider: () => Promise<void>
  getProvider: () => WalletConnectProvider
} {
  return {
    resetProvider,
    setupProvider,
    enableProvider,
    getProvider,
  }
}
