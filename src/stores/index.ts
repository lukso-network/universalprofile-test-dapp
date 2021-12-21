import { reactive } from "vue";
import { Store, Channel } from "@/types";
import useEthereumRpc from "@/compositions/useEthereumRpc";

export const store = reactive<Store>({
  isConnected: false,
  address: "",
  chainId: 0,
  balance: 0,
  channel: undefined,
});

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

      setState("address", address);
      setState("isConnected", true);
      setState("channel", channel);
      setState("balance", await getBalance(address));
    },
    setDisconnected: () => {
      setState("address", "");
      setState("isConnected", false);
      setState("channel", undefined);
      setState("balance", 0);
    },
  };
}
