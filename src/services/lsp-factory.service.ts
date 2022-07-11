import { NonceManager } from "@ethersproject/experimental";
import { LSPFactory } from "@lukso/lsp-factory.js-alpha";
import { getSigner } from "./provider.service";

export async function getLspFactory(): Promise<LSPFactory> {
  const { provider, signer } = await getSigner();
  const nonceManager = new NonceManager(signer);
  return new LSPFactory(nonceManager, provider);
}
