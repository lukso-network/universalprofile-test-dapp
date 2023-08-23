import Web3 from 'web3'
import {
  provider as Provider,
  HttpProvider,
  RLPEncodedTransaction,
} from 'web3-core'
import { AbiItem, isAddress as baseIsAddress } from 'web3-utils'
import { Contract, ContractOptions } from 'web3-eth-contract'
import { TransactionConfig, TransactionReceipt } from 'web3-core'
import { resetNetworkConfig, setNetworkConfig } from '@/helpers/config'

let web3: Web3

const setupWeb3 = async (provider: Provider): Promise<void> => {
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

const personalSign = async (
  message: string,
  address: string,
  password?: string
): Promise<string> => {
  return await web3.eth.personal.sign(message, address, password ?? '')
}

const signTransaction = async (
  transaction: TransactionConfig,
  address: string
): Promise<string> => {
  // Even though it says that RLPEncodedTransaction object is returned
  // we might get just a string that is an encoded transaction. Thus, the "typeof" check.
  const response = await web3.eth.signTransaction(transaction, address)
  if (typeof response === 'string') {
    return response
  }
  return response.raw
}

const arbitraryRpc = async (
  method: string,
  params?: any[]
): Promise<string> => {
  // ;(web3.eth.currentProvider as HttpProvider).send(
  //   {
  //     jsonrpc: '2.0',
  //     method: method,
  //     params: params,
  //     id: Date.now(),
  //   },
  //   (error, result) => {
  //     console.log('arbitrary RPC sent')
  //   }
  // )
  throw new Error('aribtraryRpc function not implemented')
}

const recover = async (message: string, signature: string): Promise<string> => {
  return web3.eth.accounts.recover(message, signature)
}

const recoverRawTransaction = async (
  encodedTransaction: string
): Promise<string> => {
  return web3.eth.accounts.recoverTransaction(encodedTransaction)
}

const isAddress = (address: string): boolean => {
  return baseIsAddress(address)
}

export default function useWeb3(): {
  setupWeb3: (provider: Provider) => Promise<void>
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
  personalSign: (
    message: string,
    address: string,
    password?: string
  ) => Promise<string>
  signTransaction: (
    transaction: TransactionConfig,
    address: string
  ) => Promise<string>
  arbitraryRpc: (rpc: string, payload: any, address: string) => Promise<any>
  recover: (message: string, signature: string) => Promise<string>
  recoverRawTransaction: (encodedTransaction: string) => Promise<string>
  isAddress: (address: string) => boolean
} {
  return {
    setupWeb3,
    getWeb3,
    getChainId,
    contract,
    getBalance,
    sendTransaction,
    accounts,
    requestAccounts,
    sign,
    personalSign,
    signTransaction,
    arbitraryRpc,
    recover,
    recoverRawTransaction,
    isAddress,
  }
}
