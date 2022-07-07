import { getSigner } from "@/services/provider.service";
import { LSPFactory } from "@lukso/lsp-factory.js";
import useWeb3 from "./useWeb3";

export async function useLspFactory(): Promise<LSPFactory> {
  const { provider } = await getSigner();
  const rpcProvider = "https://rpc.l16.lukso.network"; // RPC provider url
  const { chainId } = await provider.getNetwork();
  return new LSPFactory(rpcProvider, {
    deployKey: "",
    chainId,
  });
}
