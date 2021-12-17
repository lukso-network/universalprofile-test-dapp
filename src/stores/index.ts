import { reactive } from "vue";
import { Store } from "@/types";

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
