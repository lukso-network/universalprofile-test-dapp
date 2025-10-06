import type { ERC725 } from '@erc725/erc725.js'
import { WindowProvider } from '@wagmi/connectors'
import Web3 from 'web3'
import Contract from 'web3-eth-contract'
import { Store } from './types'
import { provider } from 'web3-core'
import { EthereumProvider } from '@walletconnect/ethereum-provider'
import type { UPClientProvider } from '@lukso/up-provider'
declare global {
  interface Window {
    web3: Web3
    store?: Store
    erc725Account?: Contract
    keyManager?: Contract
    ERC725?: typeof ERC725
    ethereum?: WindowProvider | provider | EthereumProvider | UPClientProvider
    lukso?: WindowProvider | provider | EthereumProvider | UPClientProvider
  }
}
