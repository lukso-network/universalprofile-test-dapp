import ERC725 from '@erc725/erc725.js'
import type { Store, Eip1193Provider } from '@/types'
import type Web3 from 'web3'
import type { Contract } from 'web3-eth-contract'

export {}
declare global {
  interface Window {
    web3: Web3
    store?: Store
    erc725Account?: Contract
    keyManager?: Contract
    ERC725?: typeof ERC725
    ethereum?: Eip1193Provider
    lukso?: Eip1193Provider
  }
}
