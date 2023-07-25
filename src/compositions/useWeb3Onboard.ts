import { AbiItem, isAddress as baseIsAddress } from 'web3-utils'
import Onboard, { OnboardAPI } from '@web3-onboard/core'
import injectedModule from '@web3-onboard/injected-wallets'
import { ConnectModalOptions, WalletState } from '@web3-onboard/core/dist/types'
import { Contract } from 'ethers'
import { ContractOptions } from 'web3-eth-contract'
import useWeb3 from './useWeb3'
import EthereumProvider from '@walletconnect/ethereum-provider/dist/types/EthereumProvider'

const injected = injectedModule()

const wallets = [injected]

const chains = [
  {
    id: 1,
    token: 'LYX',
    label: 'LUKSO Testnet',
    rpcUrl: 'https://rpc.testnet.lukso.network/',
  },
  {
    id: 2,
    token: 'LYX',
    label: 'LUKSO L16',
    rpcUrl: 'https://rpc.l16.lukso.network',
  },
]

const appMetadata = {
  name: 'Lukso Test dApp',
  icon: document.location.origin + '/lukso.png',
  logo: document.location.origin + '/lukso.png',
  description: 'My test dApp using Onboard',
  recommendedInjectedWallets: [
    { name: 'Lukso', url: 'https://lukso.network/' },
  ],
}

const connect: ConnectModalOptions = {
  showSidebar: true,
  autoConnectLastWallet: true,
  autoConnectAllPreviousWallet: true,
  iDontHaveAWalletLink: 'https://lukso.network/',
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
