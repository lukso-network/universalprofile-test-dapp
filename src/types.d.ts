import { LinkMetdata } from '@lukso/lsp-factory.js'
import { TokenInfo } from './stores'
import {
  UP_MODAL,
  WALLET_CONNECT,
  WEB3_ONBOARD,
  WINDOW_LUKSO,
} from './helpers/config'

export interface Errors {
  search?: string
  amount?: string
}

export interface Notification {
  message?: string
  type?: string
}

export type NotificationType = 'primary' | 'danger' | 'info' | 'warning'

export type Channel =
  | typeof WINDOW_LUKSO
  | typeof WALLET_CONNECT
  | typeof WEB3_ONBOARD
  | typeof UP_MODAL

export type Eip1193Provider = {
  request: (args: {
    method: string
    params?: unknown[] | Record<string, unknown>
  }) => Promise<unknown>
  on?: (...args: any[]) => unknown
  removeListener?: (...args: any[]) => unknown
  disconnect?: () => Promise<void>
  accounts?: string[]
}

export interface Store {
  isConnected: boolean
  address: string
  chainId: number
  balance: number
  channel?: Channel
  tokenAddress?: string
  assets: string[]
  lsp7: TokenInfo[]
  lsp8: TokenInfo[]
  contextAccounts?: string[]
}

export type Lsp4Metadata = {
  description: string
  links: LinkMetdata[]
  icon?: File
  images?: File[]
}

export type Token = {
  type?: ContractStandard
  name: string
  symbol: string
  isNonDivisible?: boolean
}
