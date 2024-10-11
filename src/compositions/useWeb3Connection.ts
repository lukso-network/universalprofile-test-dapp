import { AbiItem, isAddress as baseIsAddress } from 'web3-utils'
import {
  getSelectedNetworkConfig,
  UP_CONNECTED_ADDRESS,
  WALLET_CONNECT,
  WEB3_ONBOARD,
} from '@/helpers/config'
import useWalletConnectV2 from './useWalletConnectV2'
import useWeb3Onboard from './useWeb3Onboard'
import { ref } from 'vue'
import {
  TransactionConfig,
  TransactionReceipt,
  provider as ProviderType,
} from 'web3-core'
import { resetNetworkConfig, setNetworkConfig } from '@/helpers/config'
import { getState, useState } from '@/stores'
import EthereumProvider from '@walletconnect/ethereum-provider/dist/types/EthereumProvider'
import Web3 from 'web3'
import { ContractOptions, Contract } from 'web3-eth-contract'
import { EthereumProviderError } from 'eth-rpc-errors'
import { createServer, createClient } from '@lukso/embedded-provider'
import { JSONRPCErrorResponse, JSONRPCSuccessResponse } from 'json-rpc-2.0'
const oldProvider = window.lukso
if (oldProvider) {
  const server = createServer()
  server.addMethod('exampleMethod', params => {
    console.log('params', params)
    return `Hello, ${params.name}!`
  })
  server.applyMiddleware(async (next, request) => {
    const { method: _method, params: _params, id, jsonrpc } = request
    const method =
      typeof _method === 'string'
        ? _method
        : (_method as unknown as { method: string; params: unknown[] }).method
    const params =
      typeof _method === 'string'
        ? _params
        : (_method as unknown as { method: string; params: unknown[] }).params
    try {
      console.log('request', request)
      const response = await oldProvider.request({ method, params })
      console.log('response', response)
      return { id, jsonrpc, result: response } as JSONRPCSuccessResponse
    } catch (error) {
      console.error(error)
      console.log({ id, jsonrpc, error } as JSONRPCErrorResponse)
    }
    console.log('request', request)
    if (request.method === 'exampleMethod2') {
      console.log('exampleMethod2')
      return {
        jsonrpc,
        id,
        result: { message: 'Hello, World!' } as any,
      } as JSONRPCSuccessResponse
    }
    return await next(request)
  })
}
const client = createClient()
// client.request('exampleMethod', { name: 'World' }).then(result => {
//   console.log('result', result)
// })
// client.request('exampleMethod2', { name: 'World' }).then(result => {
//   console.log('result2', result)
// })
const oldRequest = client.request.bind(client)
client.request = (method, params) => {
  if (typeof method === 'string') {
    return oldRequest(method, params)
  }
  const { method: _method, params: _params } = method as {
    method: string
    params: unknown[]
  }
  return oldRequest(_method, _params)
}
window.lukso = client

const web3Onboard = useWeb3Onboard()
const web3WalletConnectV2 = useWalletConnectV2()
const { setConnected, setDisconnected } = useState()

const provider = ref<EthereumProvider>()
let web3: Web3

const setupWeb3 = async (provider: EthereumProvider): Promise<void> => {
  web3 = new Web3(provider as ProviderType)
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
): Promise<ProviderType | undefined> => {
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
    return provider.value as ProviderType
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
  if (getState('channel') === WALLET_CONNECT) {
    await provider.value?.disconnect()
  } else if (getState('channel') === WEB3_ONBOARD) {
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

const estimateGas = async (transaction: TransactionConfig) => {
  return Number(await web3.eth.estimateGas(transaction))
}

const executeCall = (transaction: TransactionConfig): Promise<string> => {
  const { url } = getSelectedNetworkConfig().http || {}
  if (!url) {
    throw new Error('No RPC URL provided for the network')
  }
  const web3 = new Web3(url)
  return web3.eth.call(transaction)
}

const sendTransaction = (
  transaction: TransactionConfig
): Promise<TransactionReceipt> => {
  return web3.eth
    .sendTransaction(transaction)
    .on('transactionHash', hash => {
      console.log('Transaction hash:', hash)
    })
    .on('receipt', (receipt: any) => {
      console.log('Transaction receipt:', receipt)
    })
    .once('sending', payload => {
      console.log(JSON.stringify(payload, null, 2))
    })
}

const sendRequest = (request: any): Promise<any> => {
  console.log('Sending request:', request)
  if (provider.value) {
    return provider.value.request(request)
  }
  console.warn('Provider is not set up or not connected.')
  return Promise.resolve(null)
}

const accounts = async () => {
  const [account] = await web3.eth.getAccounts()
  return account
}

const getBaseFee = async (): Promise<number> => {
  return await web3.eth
    .getBlock('pending')
    .then(block => Number(block.baseFeePerGas))
}

const defaultMaxPriorityFeePerGas = async (): Promise<number> => {
  return 2_500_000_000
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
  // Even though `signTransaction` says that RLPEncodedTransaction object is returned
  // we might get just a string that is an encoded transaction. Thus, the "typeof" check.
  const response = await web3.eth.signTransaction(transaction, address)
  if (typeof response === 'string') {
    return response
  }
  return response.raw
}

const recoverRawTransaction = async (
  encodedTransaction: string
): Promise<string> => {
  return web3.eth.accounts.recoverTransaction(encodedTransaction)
}

const isAddress = (address: string): boolean => {
  return baseIsAddress(address)
}

export default function useWeb3Connection() {
  return {
    setupProvider,
    getProvider,
    disconnect,
    getWeb3,
    getChainId,
    contract,
    getBalance,
    sendTransaction,
    defaultMaxPriorityFeePerGas,
    executeCall,
    accounts,
    requestAccounts,
    estimateGas,
    getBaseFee,
    sign,
    recover,
    personalSign,
    signTransaction,
    recoverRawTransaction,
    isAddress,
    sendRequest,
  }
}
