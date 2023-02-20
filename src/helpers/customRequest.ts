
import useWalletConnect from '@/compositions/useWalletConnect'
import useWalletConnectV2 from '@/compositions/useWalletConnectV2'

const { getProvider, sendCustomWCRequest } = useWalletConnect()
const { getWCV2Provider, sendCustomWCV2Request } = useWalletConnectV2()

const sendRequest = async (request: any): Promise<any> => {
    const wcProvider = getProvider()
    const wcv2Provider = getWCV2Provider()
    if (wcProvider && wcProvider.wc.connected) {
      await sendCustomWCRequest(request)
    } else if (wcv2Provider && wcv2Provider.connected) {
      await sendCustomWCV2Request(request)
    } else {
      await window.ethereum.request(request)
    }
}

export { sendRequest }