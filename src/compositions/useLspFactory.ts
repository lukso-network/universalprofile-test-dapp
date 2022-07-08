import { NETWORK_URL, PRIVATE_KEY } from "@/helpers/config";
import { getState } from "@/stores";
import { LSPFactory } from "@lukso/lsp-factory.js";

export async function useLspFactory(): Promise<LSPFactory | null> {
  const chainId = getState("chainId");
  if (chainId && NETWORK_URL) {
    return new LSPFactory(NETWORK_URL, {
      deployKey: PRIVATE_KEY,
      chainId,
    });
  }
  return null;
}
