import Web3 from "web3";
// import { provider as Provider } from "web3-core";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";

export let web3: Web3;
export let provider: any;
export let web3Modal: Web3Modal;
// export let wsProvider: WalletConnectProvider;

export async function setupWeb3(): Promise<void> {
  // wsProvider = new WalletConnectProvider({
  //   infuraId: "27e484dcd9e3efcfd25a83a78777cdf1",
  // });

  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        // infuraId: "",
        rpc: {
          22: "https://rpc.l14.lukso.network",
        },
      },
    },
  };

  web3Modal = new Web3Modal({
    cacheProvider: true,
    disableInjectedProvider: false,
    providerOptions,
  });
  provider = await web3Modal.connect();
  web3 = new Web3(provider);
}

export function resetProvider(): void {
  provider = null;
  web3 = new Web3(null);
}
