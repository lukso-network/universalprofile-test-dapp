import { AbiItem, isAddress as baseIsAddress } from 'web3-utils'
import {
  UP_CONNECTED_ADDRESS,
  WALLET_CONNECT,
  WEB3_ONBOARD,
} from '@/helpers/config'
import useWalletConnectV2 from './useWalletConnectV2'
import useWeb3Onboard from './useWeb3Onboard'
import { ref } from 'vue'
import { TransactionConfig, TransactionReceipt } from 'web3-core'
import { resetNetworkConfig, setNetworkConfig } from '@/helpers/config'
import { getState, useState } from '@/stores'
import EthereumProvider from '@walletconnect/ethereum-provider/dist/types/EthereumProvider'
import Web3 from 'web3'
import { ContractOptions, Contract } from 'web3-eth-contract'
import { EthereumProviderError } from 'eth-rpc-errors'

const web3Onboard = useWeb3Onboard()
const web3WalletConnectV2 = useWalletConnectV2()
const { setConnected, setDisconnected } = useState()

const provider = ref<EthereumProvider>()
let web3: Web3

const setupWeb3 = async (provider: EthereumProvider): Promise<void> => {
  web3 = new Web3(provider)
  window.web3 = web3
  web3.eth
    ?.getChainId()
    .then(chainId => {
      setNetworkConfig(chainId)
    })
    .catch(() => {
      // Ignore error
      resetNetworkConfig()
    })
}

const setupProvider = async (
  meansOfConnection: string
): Promise<EthereumProvider | undefined> => {
  try {
    const isWalletConnectUsed = meansOfConnection === WALLET_CONNECT
    const isWeb3OnboardUsed = meansOfConnection === WEB3_ONBOARD

    let address = ''
    if (isWalletConnectUsed) {
      provider.value = await web3WalletConnectV2.setupWCV2Provider()
      address = await provider.value.accounts[0]
      await setupWeb3(provider.value)
    } else if (isWeb3OnboardUsed) {
      const primaryWallet = await web3Onboard.setupWeb3Onboard()
      provider.value = primaryWallet.provider as EthereumProvider
      address = primaryWallet.accounts[0].address
      await setupWeb3(provider.value)
    } else {
      provider.value = window.lukso
      await setupWeb3(provider.value as EthereumProvider)
      let accounts = await web3.eth.getAccounts()

      address = accounts[0]
      if (!address) {
        accounts = await requestAccounts()
        address = accounts[0]
      }
    }
    if (address) {
      setConnected(address, meansOfConnection)
      localStorage.setItem(UP_CONNECTED_ADDRESS, address)
    }
    return provider.value
  } catch (error) {
    const epError = error as EthereumProviderError<Error>

    if (epError.code === 4100) {
      const address = (await requestAccounts())[0]
      setConnected(address, meansOfConnection)
      localStorage.setItem(UP_CONNECTED_ADDRESS, address)
    }
  }
}

const disconnect = async () => {
  if (getState('channel') == WALLET_CONNECT) {
    await provider.value?.disconnect()
  } else if (getState('channel') == WEB3_ONBOARD) {
    await web3Onboard.disconnect()
  } else {
    localStorage.removeItem(UP_CONNECTED_ADDRESS)
  }
  await setupWeb3(undefined as unknown as EthereumProvider)
  setDisconnected()
}

const getProvider = () => {
  return provider.value as EthereumProvider
}

const dummy = new Web3()

const getWeb3 = (): Web3 => {
  return web3 || dummy
}

const getChainId = async (): Promise<number> => {
  return await web3.eth?.getChainId()
}

const contract = (
  jsonInterface: AbiItem[],
  address?: string,
  options?: ContractOptions
): Contract => {
  return new web3.eth.Contract(jsonInterface, address, options)
}

const getBalance = async (address: string) => {
  const wei = await web3.eth.getBalance(address)
  return web3.utils.fromWei(wei)
}

const sendTransaction = async (transaction: TransactionConfig) => {
  return await web3.eth
    .sendTransaction(transaction)
    .on('receipt', function (receipt: any) {
      console.log(receipt)
    })
    .once('sending', payload => {
      console.log(JSON.stringify(payload, null, 2))
    })
}

const sendRequest = async (request: any): Promise<any> => {
  if (provider.value) {
    return await provider.value.request(request)
  } else {
    console.warn('Provider is not set up or not connected.')
  }
}

const accounts = async () => {
  const [account] = await web3.eth.getAccounts()
  return account
}

const requestAccounts = async (): Promise<string[]> => {
  const accountsRequest: string[] = await web3.eth.requestAccounts()
  return accountsRequest
}

const sign = async (message: string, address: string): Promise<string> => {
  return await web3.eth.sign(message, address)
}

const recover = async (message: string, signature: string): Promise<string> => {
  return web3.eth.accounts.recover(message, signature)
}

const isAddress = (address: string): boolean => {
  return baseIsAddress(address)
}

export default function useWeb3Connection(): {
  setupProvider: (
    meansOfConnection: string
  ) => Promise<EthereumProvider | undefined>
  getProvider: () => EthereumProvider
  getWeb3: () => Web3
  getChainId: () => Promise<number>
  contract: (
    jsonInterface: AbiItem[],
    address?: string,
    options?: ContractOptions
  ) => Contract
  getBalance: (address: string) => Promise<string>
  sendTransaction: (
    transaction: TransactionConfig
  ) => Promise<TransactionReceipt>
  accounts: () => Promise<string>
  requestAccounts: () => Promise<string[]>
  sign: (message: string, address: string) => Promise<string>
  recover: (message: string, signature: string) => Promise<string>
  isAddress: (address: string) => boolean
  sendRequest: (request: any) => Promise<any>
  disconnect: () => Promise<void>
} {
  return {
    setupProvider,
    getProvider,
    disconnect,
    getWeb3,
    getChainId,
    contract,
    getBalance,
    sendTransaction,
    accounts,
    requestAccounts,
    sign,
    recover,
    isAddress,
    sendRequest,
  }
}
