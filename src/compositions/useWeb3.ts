import Web3 from 'web3'
import { provider as Provider } from 'web3-core'
import { AbiItem } from 'web3-utils'
import { Contract, ContractOptions } from 'web3-eth-contract'
import { TransactionConfig, TransactionReceipt } from 'web3-core'

let web3: Web3

const setupWeb3 = (provider: Provider): void => {
  web3 = new Web3(provider)
  window.web3 = web3
}

const getWeb3 = (): Web3 => {
  return web3
}

const getChainId = async (): Promise<number> => {
  return await web3.eth?.getChainId()
}

const contract = (
  jsonInterface: AbiItem,
  address?: string,
  options?: ContractOptions
) => {
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

const recover = async (message: string, signature: string): Promise<string> => {
  return web3.eth.accounts.recover(message, signature)
}

const isAddress = (address: string): boolean => {
  return web3.utils.isAddress(address)
}

export default function useWeb3(): {
  setupWeb3: (provider: Provider) => void
  getWeb3: () => Web3
  getChainId: () => Promise<number>
  contract: (
    jsonInterface: AbiItem,
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
    recover,
    isAddress,
  }
}
