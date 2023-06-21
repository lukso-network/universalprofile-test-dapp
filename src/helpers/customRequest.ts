import useWalletConnectV2 from '@/compositions/useWalletConnectV2'

const { getWCV2Provider, sendCustomWCV2Request } = useWalletConnectV2()

const sendRequest = async (request: any): Promise<any> => {
  const wcv2Provider = getWCV2Provider()
  if (wcv2Provider && wcv2Provider.connected) {
    await sendCustomWCV2Request(request)
  } else {
    await (window.ethereum as any)?.request(request)
  }
}

export { sendRequest }
