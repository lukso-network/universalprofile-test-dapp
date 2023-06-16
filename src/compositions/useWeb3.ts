import Web3 from 'web3'
import { provider as Provider } from 'web3-core'
import { AbiItem, isAddress } from 'web3-utils'
import { Contract, ContractOptions } from 'web3-eth-contract'
import { TransactionConfig, TransactionReceipt } from 'web3-core'
import { DEFAULT_NETWORK_CONFIG, setNetworkConfig } from '@/helpers/config'

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
      setNetworkConfig(DEFAULT_NETWORK_CONFIG.chainId)
    })
}

const getWeb3 = (): Web3 => {
  return web3 || {}
}

const getChainId = async (): Promise<number> => {
  return await web3.eth?.getChainId()
}

const contract = (
  jsonInterface: AbiItem[],
  address?: string,
  options?: ContractOptions
): Contract => {
  return new Contract(jsonInterface, address, options)
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
