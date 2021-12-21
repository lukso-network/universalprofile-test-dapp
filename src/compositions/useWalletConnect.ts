import WalletConnectProvider from "@walletconnect/web3-provider";
import { setState, useState } from "@/stores";
import { NETWORK_URL } from "@/helpers/config";
import useWeb3 from "@/compositions/useWeb3";
import { provider as Provider } from "web3-core";

let provider: WalletConnectProvider;

const setupProvider = async (): Promise<void> => {
  const { setupWeb3 } = useWeb3();

  provider = new WalletConnectProvider({
    rpc: {
      22: NETWORK_URL,
    },
    bridge: "https://bridge.walletconnect.org",
    chainId: 22,
  });

  provider.on("connect", (error: any, payload: any) => {
    if (error) {
      throw error;
    }

    setState("isConnected", true);
    setupWeb3(provider as unknown as Provider);
  });

  provider.on("accountsChanged", async (accounts: string[]) => {
    const { setConnected } = useState();
    const [address] = accounts;

    setConnected(address, "walletConnect");
  });

  setupWeb3(provider as unknown as Provider);
};

const resetProvider = async (): Promise<void> => {
  await provider.disconnect();
};

const enableProvider = async (): Promise<void> => {
  await provider.enable();
};

const getProvider = (): WalletConnectProvider => {
  return provider;
};

export default function useWalletConnect(): {
  resetProvider: () => Promise<void>;
  setupProvider: () => Promise<void>;
  enableProvider: () => Promise<void>;
  getProvider: () => WalletConnectProvider;
} {
  return {
    resetProvider,
    setupProvider,
    enableProvider,
    getProvider,
  };
}
