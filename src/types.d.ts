import { LinkMetdata } from '@lukso/lsp-factory.js'
import { TokenInfo } from './stores'

export interface Errors {
  search?: string
  amount?: string
}

export interface Notification {
  message?: string
  type?: string
}

export type NotificationType = 'primary' | 'danger' | 'info' | 'warning'

export type Channel = WINDOW_ETHEREUM | WALLET_CONNECT | WEB3_ONBOARD

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
