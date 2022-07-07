import { getSigner } from "@/services/provider.service";
import { NonceManager } from "@ethersproject/experimental";
import { LSPFactory } from "@lukso/lsp-factory.js";

export async function useLspFactory(): Promise<LSPFactory> {
  const { provider, signer } = await getSigner();
  const nonceManager = new NonceManager(signer);
  return new LSPFactory(nonceManager, provider);
}
