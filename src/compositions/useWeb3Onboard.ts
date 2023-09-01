import Onboard, { OnboardAPI } from '@web3-onboard/core'
import injectedModule from '@web3-onboard/injected-wallets'
import luksoModule from '@lukso/web3-onboard-config'
import { ConnectModalOptions } from '@web3-onboard/core/dist/types'

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

const LuksoIcon = `<svg version="1.1" id="Ebene_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
viewBox="0 0 550 604" style="enable-background:new 0 0 550 604;" xml:space="preserve">
<path fill="#FE005B" d="M499.5,114.6L325,13.9C294.1-4,255.9-4,225,13.9L50.5,114.6c-30.9,17.9-50,50.9-50,86.6v201.5
c0,35.7,19.1,68.7,50,86.6L225,590.1c30.9,17.9,69.1,17.9,100,0l174.5-100.8c30.9-17.9,50-50.9,50-86.6V201.2
C549.5,165.5,530.5,132.5,499.5,114.6z M413.5,322l-51.9,89.9c-7.1,12.4-20.3,20-34.6,20H223.1c-14.3,0-27.5-7.6-34.6-20L136.5,322
c-7.1-12.4-7.1-27.6,0-40l51.9-89.9c7.1-12.4,20.3-20,34.6-20h103.8c14.3,0,27.5,7.6,34.6,20l51.9,89.9
C420.6,294.4,420.6,309.6,413.5,322z"/>
<path fill="#FFF1F8" d="M413.5,322l-51.9,89.9c-7.1,12.4-20.3,20-34.6,20H223.1c-14.3,0-27.5-7.6-34.6-20L136.5,322
c-7.1-12.4-7.1-27.6,0-40l51.9-89.9c7.1-12.4,20.3-20,34.6-20h103.8c14.3,0,27.5,7.6,34.6,20l51.9,89.9
C420.6,294.4,420.6,309.6,413.5,322z"/>
</svg>`

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

const setupWeb3Onboard = async () => {
  onboard = Onboard({
    wallets,
    chains,
    appMetadata,
    connect,
  })
  const connectedWallets = await onboard.connectWallet()
  return connectedWallets[0]
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
    disconnect,
    setChainId,
    setupWeb3Onboard,
  }
}
