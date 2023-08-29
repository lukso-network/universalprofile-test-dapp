import useWalletConnectV2 from '@/compositions/useWalletConnectV2'
import useWeb3Onboard from '@/compositions/useWeb3Onboard'
import { MEANS_OF_CONNECTION, WALLET_CONNECT } from '@/helpers/config'

const { getWCV2Provider, sendCustomWCV2Request } = useWalletConnectV2()

const { getWeb3OnboardProvider } = useWeb3Onboard()
const provider = getWeb3OnboardProvider()

const sendRequest = async (request: any): Promise<any> => {
  const channel = localStorage.getItem(MEANS_OF_CONNECTION)
  const isWalletConnectUsed = channel === WALLET_CONNECT
  if (isWalletConnectUsed) {
    const wcv2Provider = getWCV2Provider()
    if (wcv2Provider?.connected) {
      return await sendCustomWCV2Request(request)
    }
  } else {
    return await (provider as any)?.request(request)
  }
}

export { sendRequest }
