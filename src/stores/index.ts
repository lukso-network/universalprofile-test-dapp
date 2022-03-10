import { reactive } from "vue";
import { Store, Channel } from "@/types";
import useWeb3 from "@/compositions/useWeb3";
import { DEFAULT_GAS, DEFAULT_GAS_PRICE } from "@/helpers/config";
import UniversalProfile from "@lukso/universalprofile-smart-contracts/artifacts/UniversalProfile.json";
import KeyManager from "@lukso/universalprofile-smart-contracts/artifacts/LSP6KeyManager.json";

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

export async function setState(
  key: keyof Store,
  newState: unknown
): Promise<void> {
  (store[key] as any) = newState;
}

export function useState(): {
  setConnected: (address: string, channel: Channel) => Promise<void>;
  setDisconnected: () => void;
} {
  return {
    setConnected: async (address: string, channel: Channel) => {
      const { getChainId, getBalance, contract } = useWeb3();

      setState("address", address);
      setState("isConnected", true);
      setState("channel", channel);
      setState("chainId", await getChainId());
      setState("balance", await getBalance(address));

      window.erc725Account = contract(UniversalProfile.abi as any, address, {
        gas: DEFAULT_GAS,
        gasPrice: DEFAULT_GAS_PRICE,
      });

      const upOwner = await window.erc725Account.methods.owner().call();
      window.keyManager = contract(KeyManager.abi as any, upOwner, {
        gas: DEFAULT_GAS,
        gasPrice: DEFAULT_GAS_PRICE,
      });
    },
    setDisconnected: () => {
      setState("address", "");
      setState("isConnected", false);
      setState("channel", undefined);
      setState("chainId", 0);
      setState("balance", 0);

      window.erc725Account = undefined;
    },
  };
}
