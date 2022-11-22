import {LinkMetdata} from "@lukso/lsp-factory.js";

export interface Errors {
  search?: string
  amount?: string
}

export interface Notification {
  message?: string
  type?: string
}

export type NotificationType = 'primary' | 'danger' | 'info' | 'warning'

export type Channel = 'browserExtension' | 'walletConnect'

export enum ContractStandard {
  LSP8 = 'LSP8',
  LSP7 = 'LSP7',
  ERC20 = 'ERC20',
  ERC777 = 'ERC777',
  ERC721 = 'ERC721',
}

export interface Store {
  isConnected: boolean
  address: string
  chainId: number
  balance: number
  channel?: Channel
  tokenAddress?: string
}

export type Lsp4Metadata = {
  description: string
  links: LinkMetdata[]
  icon?: File
  images?: File[]
}