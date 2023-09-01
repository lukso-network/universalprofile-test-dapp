import { Ethereum } from '@wagmi/connectors'

export {}
declare global {
  interface Window {
    web3: Web3
    store?: Store
    erc725Account?: Contract
    keyManager?: Contract
    ERC725?: ERC725
    ethereum?: Ethereum
    lukso?: Ethereum
  }
}
