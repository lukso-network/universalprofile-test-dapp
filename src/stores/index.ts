import { reactive } from "vue";
import { Store, Channel } from "@/types";
import useEthereumRpc from "@/compositions/useEthereumRpc";
import useWeb3 from "@/compositions/useWeb3";

export const store = reactive<Store>({
  isConnected: false,
  address: "",
  chainId: 0,
  balance: 0,
  channel: undefined,
});

window.store = store;

export const getState: (key: keyof Store) => any = (key) => {
  return store[key];
};

export async function setState(key: keyof Store, newState: any): Promise<void> {
  (store[key] as any) = newState;
}

export function useState(): {
  setConnected: (address: string, channel: Channel) => Promise<void>;
  setDisconnected: () => void;
} {
  return {
    setConnected: async (address: string, channel: Channel) => {
      const { getBalance } = useEthereumRpc();
      const { getChainId } = useWeb3();

      setState("address", address);
      setState("isConnected", true);
      setState("channel", channel);
      setState("chainId", await getChainId());
      setState("balance", await getBalance(address));
    },
    setDisconnected: () => {
      setState("address", "");
      setState("isConnected", false);
      setState("channel", undefined);
      setState("chainId", 0);
      setState("balance", 0);
    },
  };
}
