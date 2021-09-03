import { LSPFactory } from "@lukso/lspfactory.js";
import { getSigner } from "./provider.service";

export async function getLspFactory(): Promise<LSPFactory> {
  const { provider, signer } = await getSigner();
  return new LSPFactory(signer, provider);
}
