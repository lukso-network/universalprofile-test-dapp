import SignClient from '@walletconnect/sign-client'
import { EthereumProvider } from '@walletconnect/ethereum-provider'
import { setState, useState, getState } from '@/stores'
import useWeb3 from '@/compositions/useWeb3'
import { provider as Provider } from 'web3-core'
import { DEFAULT_NETWORK_CONFIG } from '@/helpers/config'

async function openWalletConnectV2Modal() {
  // const web3Modal = new Web3Modal({
  //   projectId: '969ebd167fcb13001839a2d41a7f7170',
  //   walletConnectVersion: 2,
  // })
  // const signClient = await SignClient.init({
  //   projectId: '969ebd167fcb13001839a2d41a7f7170',
  //   metadata: {
  //       name: "UP Test DApp",
  //       description: "UP Test DApp",
  //       url: "https://up-test-dapp.lukso.tech/",
  //       icons: ["https://up-test-dapp.lukso.tech/lukso.png"],
  //     },
  // })

  const provider = await EthereumProvider.init({
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
    // setupWeb3(provider as unknown as Provider)
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

    setConnected(address, 'walletConnect')
  })

  //setupWeb3(provider as unknown as Provider)

  await provider.connect()

  console.log(provider.accounts)

  // signClient.on("session_event", (event) => {
  //   // Handle session events, such as "chainChanged", "accountsChanged", etc.
  //   console.log("WalletConnectV2 session_event: " + JSON.stringify(event))
  // });

  // signClient.on("session_update", ({ topic, params }) => {
  //   const { namespaces } = params;
  //   const _session = signClient.session.get(topic);
  //   // Overwrite the `namespaces` of the existing session with the incoming one.
  //   const updatedSession = { ..._session, namespaces };
  //   // Integrate the updated session state into your dapp state.
  //   // onSessionUpdate(updatedSession);
  //   console.log("WalletConnectV2 session_update")
  // });

  // signClient.on("session_delete", () => {
  //   // Session was deleted -> reset the dapp state, clean up from user session, etc.
  //   console.log("WalletConnectV2 session_delete")
  // });

  // if (signClient) {
  //   const namespaces = {
  //     eip155: {
  //       // array of JSON-RPC methods expected to be used during the session
  //       methods: [
  //         'eth_sendTransaction',
  //         'eth_sign',
  //         'personal_sign',
  //         'eth_getBalance',
  //         'eth_getAccounts',
  //         'eth_requestAccounts',
  //         'up_import',
  //         'up_addTransactionRelayer',
  //       ],
  //       //  array of CAIP-2-compliant chainId's. This parameter MAY be omitted if a single-chain scope is already declared in the index of the object.
  //       chains: ['eip155:2828'],
  //       //  array of JSON-RPC message/events expected to be emitted during the session
  //       events: ['accountsChanged'],
  //     },
  //   }
  //   const { uri, approval } = await signClient.connect({
  //     requiredNamespaces: namespaces,
  //   })

  //   try {
  //       if (uri) {
  //       await web3Modal.openModal({
  //           uri,
  //           standaloneChains: namespaces.eip155.chains,
  //       })
  //       const session = await approval();
  //       //onSessionConnect(session);
  //       console.log("onSessionConnect")
  //       console.log(session)
  //       console.log(JSON.stringify(session))
  //       web3Modal.closeModal()
  //       }
  //   } catch (e) {
  //       console.log(e)
  //       web3Modal.closeModal()
  //   }
}

export { openWalletConnectV2Modal }
