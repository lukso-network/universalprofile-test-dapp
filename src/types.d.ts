import { LSP3Profile } from "@lukso/lsp-factory.js";

export interface Errors {
  search?: string;
  amount?: string;
}

export interface Notification {
  message?: string;
  type?: string;
}

export interface LSP3ProfileNested extends LSP3Profile {
  LSP3Profile?: LSP3Profile;
}

export type Channel = "browserExtension" | "walletConnect";

export interface Store {
  isConnected: boolean;
  address: string;
  chainId: number;
  balance: number;
  channel?: Channel;
}
