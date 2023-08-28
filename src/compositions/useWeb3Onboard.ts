import Onboard, { OnboardAPI } from '@web3-onboard/core'
import injectedModule from '@web3-onboard/injected-wallets'
import luksoModule from '@lukso/web3-onboard-config'
import { ConnectModalOptions, WalletState } from '@web3-onboard/core/dist/types'
import useWeb3 from './useWeb3'
import EthereumProvider from '@walletconnect/ethereum-provider/dist/types/EthereumProvider'
import LuksoIcon from '@/assets/lukso.png'

const lukso = luksoModule()

const injected = injectedModule({
  custom: [lukso],
  sort: wallets => {
    const sorted = wallets.reduce<any[]>((sorted, wallet) => {
      if (wallet.label === 'Universal Profiles') {
        sorted.unshift(wallet)
      } else {
        sorted.push(wallet)
      }
      return sorted
    }, [])
    return sorted
  },
  displayUnavailable: ['Universal Profiles'],
})

const wallets = [injected]

const chains = [
  {
    id: 1,
    token: 'LYX',
    label: 'LUKSO Mainnet',
    rpcUrl: 'https://rpc.mainnet.lukso.network/',
  },
  {
    id: 2,
    token: 'LYXt',
    label: 'LUKSO Testnet',
    rpcUrl: 'https://rpc.testnet.lukso.network',
  },
]

const appMetadata = {
  name: 'Lukso Test dApp',
  icon: LuksoIcon,
  logo: LuksoIcon,
  description: 'My test dApp using Onboard',
  recommendedInjectedWallets: [
    {
      name: 'Universal Profiles',
      url: 'https://chrome.google.com/webstore/detail/universal-profiles/abpickdkkbnbcoepogfhkhennhfhehfn?hl=en',
    },
  ],
}

const connect: ConnectModalOptions = {
  iDontHaveAWalletLink:
    'https://chrome.google.com/webstore/detail/universal-profiles/abpickdkkbnbcoepogfhkhennhfhehfn?hl=en',
  removeWhereIsMyWalletWarning: true,
}

let onboard: OnboardAPI

const setupWeb3Onboard = () => {
  onboard = Onboard({
    wallets,
    chains,
    appMetadata,
    connect,
  })
}

const { setupWeb3 } = useWeb3()

const connectWallet = async (): Promise<WalletState[]> => {
  const wallets = await onboard.connectWallet()
  await setupWeb3(wallets[0].provider as EthereumProvider)
  return wallets
}

const disconnect = async (): Promise<void> => {
  const [primaryWallet] = onboard.state.get().wallets
  await onboard.disconnectWallet({ label: primaryWallet.label })
}

const setChainId = async (chainHex: string): Promise<void> => {
  await onboard.setChain({ chainId: chainHex })
}

export default function useWeb3Onboard() {
  return {
    connectWallet,
    disconnect,
    setChainId,
    setupWeb3Onboard,
  }
}
