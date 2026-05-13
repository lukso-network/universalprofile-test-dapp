import { AbiItem, isAddress as baseIsAddress, numberToHex } from 'web3-utils'
import {
  getSelectedNetworkConfig,
  NETWORKS,
  UP_MODAL,
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
import { getState, setState, useState } from '@/stores'
import Web3 from 'web3'
import { ContractOptions, Contract } from 'web3-eth-contract'
import { EthereumProviderError } from 'eth-rpc-errors'
import { NetworkInfo } from '@/interfaces/network'
import type { Channel, Eip1193Provider } from '@/types'

const web3Onboard = useWeb3Onboard()
const web3WalletConnectV2 = useWalletConnectV2()
const { setConnected, setDisconnected } = useState()

const provider = ref<Eip1193Provider>()
let web3: Web3
const dummy = new Web3()

const findNetwork = (targetChainId: number): NetworkInfo | undefined =>
  Object.values(NETWORKS).find(n => Number(n.chainId) === targetChainId)

const setupReadOnlyWeb3 = (targetChainId?: number): void => {
  const network = targetChainId ? findNetwork(targetChainId) : undefined
  const selectedNetwork = network ?? getSelectedNetworkConfig()
  web3 = selectedNetwork.http?.url ? new Web3(selectedNetwork.http.url) : dummy
  window.web3 = web3

  if (targetChainId) {
    setNetworkConfig(targetChainId)
  }
}

const setupWeb3 = async (nextProvider?: Eip1193Provider): Promise<void> => {
  if (!nextProvider) {
    web3 = dummy
    window.web3 = web3
    return
  }

  web3 = new Web3(nextProvider as ProviderType)
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

const setupProviderFromEip1193 = async (
  nextProvider: Eip1193Provider,
  meansOfConnection: Channel,
  userOperation = false,
  preferredAddress?: string
): Promise<ProviderType | undefined> => {
  provider.value = nextProvider
  await setupWeb3(provider.value)

  let address = preferredAddress ?? ''
  let accounts: string[] = []
  if (!address) {
    try {
      accounts = await web3.eth.getAccounts()
    } catch {
      const providerAccounts = await provider.value.request({
        method: 'eth_accounts',
      })
      accounts = Array.isArray(providerAccounts)
        ? (providerAccounts as string[])
        : []
    }
    address = accounts[0]
  }

  if (!address && userOperation) {
    accounts = await requestAccounts()
    address = accounts[0]
  }

  if (address) {
    setConnected(address, meansOfConnection)
    localStorage.setItem(UP_CONNECTED_ADDRESS, address)
  }
  return provider.value as ProviderType
}

const setupProviderlessConnection = async (
  meansOfConnection: Channel,
  address: string,
  targetChainId?: number
): Promise<void> => {
  provider.value = undefined
  setupReadOnlyWeb3(targetChainId)

  if (address) {
    await setConnected(address, meansOfConnection)
    localStorage.setItem(UP_CONNECTED_ADDRESS, address)
  }
}

const setupProvider = async (
  meansOfConnection: string,
  userOperation: boolean
): Promise<ProviderType | undefined> => {
  try {
    const isWalletConnectUsed = meansOfConnection === WALLET_CONNECT
    const isWeb3OnboardUsed = meansOfConnection === WEB3_ONBOARD
    const isUpModalUsed = meansOfConnection === UP_MODAL

    let address = ''
    if (isUpModalUsed) {
      const { default: useUpModal } = await import('./useUpModal')
      const upModal = useUpModal()
      const upModalProvider = await upModal.getConnectedProvider()
      if (!upModalProvider) return undefined
      return setupProviderFromEip1193(
        upModalProvider,
        UP_MODAL,
        userOperation,
        upModal.address.value
      )
    } else if (isWalletConnectUsed) {
      const walletConnectProvider =
        (await web3WalletConnectV2.setupWCV2Provider()) as Eip1193Provider
      provider.value = walletConnectProvider
      address = walletConnectProvider.accounts?.[0] ?? ''
      await setupWeb3(walletConnectProvider)
    } else if (isWeb3OnboardUsed) {
      const primaryWallet = await web3Onboard.setupWeb3Onboard()
      provider.value = primaryWallet.provider as Eip1193Provider
      address = primaryWallet.accounts[0].address
      await setupWeb3(provider.value)
    } else {
      provider.value = window.lukso
      await setupWeb3(provider.value)
      let accounts = await web3.eth.getAccounts()

      address = accounts[0]
      if (!address && userOperation) {
        accounts = await requestAccounts()
        address = accounts[0]
      }
    }
    if (address) {
      setConnected(address, meansOfConnection as Channel)
      localStorage.setItem(UP_CONNECTED_ADDRESS, address)
    }
    return provider.value as ProviderType
  } catch (error) {
    const epError = error as EthereumProviderError<Error>

    if (epError.code === 4100 && userOperation) {
      const address = (await requestAccounts())[0]
      setConnected(address, meansOfConnection as Channel)
      localStorage.setItem(UP_CONNECTED_ADDRESS, address)
    }
  }
}

const disconnect = async () => {
  if (getState('channel') === WALLET_CONNECT) {
    await provider.value?.disconnect?.()
  } else if (getState('channel') === WEB3_ONBOARD) {
    await web3Onboard.disconnect()
  } else if (getState('channel') === UP_MODAL) {
    const { default: useUpModal } = await import('./useUpModal')
    await useUpModal().disconnectUpModal()
  } else {
    localStorage.removeItem(UP_CONNECTED_ADDRESS)
  }
  localStorage.removeItem(UP_CONNECTED_ADDRESS)
  provider.value = undefined
  await setupWeb3()
  setDisconnected()
}

const getProvider = () => {
  return provider.value as Eip1193Provider
}

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

const nativeCurrencyFor = (network: NetworkInfo) => {
  const isLukso = network.chainId === 42 || network.chainId === 4201
  if (isLukso) {
    return {
      name: network.chainId === 42 ? 'LYX' : 'Testnet LYX',
      symbol: network.chainId === 42 ? 'LYX' : 'LYXt',
      decimals: 18,
    }
  }
  return { name: 'Ether', symbol: 'ETH', decimals: 18 }
}

const syncUpModalTargetChain = async (targetChainId: number): Promise<void> => {
  try {
    const { default: useUpModal } = await import('./useUpModal')
    await useUpModal().setTargetChainId(targetChainId)
  } catch (error) {
    console.warn('Failed to sync UP Modal target chain', error)
  }
}

const switchNetwork = async (targetChainId: number): Promise<void> => {
  const target = findNetwork(targetChainId)
  if (!target) {
    throw new Error(`Unknown network for chainId ${targetChainId}`)
  }
  const hexChainId = numberToHex(targetChainId)
  if (!provider.value) {
    setNetworkConfig(targetChainId)
    setState('chainId', targetChainId)
    await syncUpModalTargetChain(targetChainId)
    return
  }
  try {
    await provider.value.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: hexChainId }],
    })
  } catch (error) {
    const epError = error as EthereumProviderError<{
      originalError?: { code?: number }
    }>
    const code = epError?.code
    if (code === 4902) {
      await provider.value.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: hexChainId,
            chainName: target.name,
            rpcUrls: [target.http.url],
            blockExplorerUrls: target.explorer?.url
              ? [target.explorer.url]
              : undefined,
            nativeCurrency: nativeCurrencyFor(target),
          },
        ],
      })
    } else {
      throw error
    }
  }
  setNetworkConfig(targetChainId)
  setState('chainId', targetChainId)
  await syncUpModalTargetChain(targetChainId)
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
    setupProviderFromEip1193,
    setupProviderlessConnection,
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
    switchNetwork,
  }
}
