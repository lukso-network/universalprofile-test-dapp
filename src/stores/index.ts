import { reactive } from 'vue'
import { Store, Channel } from '@/types'
import useWeb3 from '@/compositions/useWeb3'
import { DEFAULT_GAS, DEFAULT_GAS_PRICE } from '@/helpers/config'
import UniversalProfile from '@/abis/UniversalProfile.json'
import KeyManager from '@/abis/LSP6KeyManager.json'
import { recalcTokens } from '@/helpers/tokenUtils'

export const store = reactive<Store>({
  isConnected: false,
  address: '',
  chainId: 0,
  balance: 0,
  channel: undefined,
  tokenAddress: undefined,
  assets: [],
  lsp7: [],
  lsp8: [],
})

window.store = store

export const getState: (key: keyof Store) => any = key => {
  return store[key]
}

export async function setState(
  key: keyof Store,
  newState: unknown
): Promise<void> {
  ;(store[key] as any) = newState
}

export function useState(): {
  setConnected: (address: string, channel: Channel) => Promise<void>
  setDisconnected: () => void
  recalcTokens: () => Promise<void>
} {
  return {
    setConnected: async (address: string, channel: Channel) => {
      const { getChainId, getBalance, contract } = useWeb3()

      setState('address', address)
      setState('isConnected', true)
      setState('channel', channel)
      setState('chainId', await getChainId())

      window.erc725Account = contract(UniversalProfile.abi as any, address, {
        gasPrice: DEFAULT_GAS_PRICE,
        gas: DEFAULT_GAS,
      })

      const upOwner = await window.erc725Account.methods.owner().call()
      window.keyManager = contract(KeyManager.abi as any, upOwner, {
        gas: DEFAULT_GAS,
        gasPrice: DEFAULT_GAS_PRICE,
      })
      // check for balance needs to be last as Wallet Connect doesn't support `eth_getBalance` method
      setState('balance', await getBalance(address))

      try {
        const { assets, lsp7, lsp8 } = JSON.parse(
          localStorage?.getItem('up:tokens') || 'null'
        )
        setState('assets', assets)
        setState('lsp7', lsp7)
        setState('lsp8', lsp8)
      } catch (err) {
        await recalcTokens()
      }
    },
    setDisconnected: () => {
      setState('address', '')
      setState('isConnected', false)
      setState('channel', undefined)
      setState('chainId', 0)
      setState('balance', 0)
      setState('assets', [])
      setState('lsp7', [])
      setState('lsp8', [])

      window.erc725Account = undefined
    },
    recalcTokens,
  }
}
