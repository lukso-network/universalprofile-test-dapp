import { getSigner } from "@/services/provider.service";
import { LSPFactory } from "@lukso/lsp-factory.js";

export async function useLspFactory(): Promise<LSPFactory> {
  const { provider } = await getSigner();
  const { chainId } = await provider.getNetwork();
  return new LSPFactory(provider, {
    deployKey:
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    chainId,
  });
}
