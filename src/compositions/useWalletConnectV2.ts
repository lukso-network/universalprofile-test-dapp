import SignClient from '@walletconnect/sign-client'
import { Web3Modal } from '@web3modal/standalone'

async function openWalletConnectV2Modal() {
  const web3Modal = new Web3Modal({
    projectId: '969ebd167fcb13001839a2d41a7f7170',
    walletConnectVersion: 2,
  })
  const client = await SignClient.init({
    projectId: '969ebd167fcb13001839a2d41a7f7170',
  })

  if (client) {
    const namespaces = {
      eip155: {
        // array of JSON-RPC methods expected to be used during the session
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
        //  array of CAIP-2-compliant chainId's. This parameter MAY be omitted if a single-chain scope is already declared in the index of the object.
        chains: ['eip155:2828'],
        //  array of JSON-RPC message/events expected to be emitted during the session
        events: ['accountsChanged'],
      },
    }
    const { uri, approval } = await client.connect({
      requiredNamespaces: namespaces,
    })
    if (uri) {
      await web3Modal.openModal({
        uri,
        standaloneChains: namespaces.eip155.chains,
      })
      await approval()
      web3Modal.closeModal()
    }
  }
}

export { openWalletConnectV2Modal }
