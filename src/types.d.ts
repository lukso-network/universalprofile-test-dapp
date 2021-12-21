export interface Errors {
  search?: string;
  amount?: string;
}

export interface Notification {
  message?: string;
  type?: string;
}

export type NotificationType = "primary" | "danger" | "info" | "warning";

export type Channel = "browserExtension" | "walletConnect";

export interface Store {
  isConnected: boolean;
  address: string;
  chainId: number;
  balance: number;
  channel?: Channel;
}
