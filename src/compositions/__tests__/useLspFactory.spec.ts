import { useLspFactory } from "@/compositions/useLspFactory";
import { NETWORK_URL, PRIVATE_KEY } from "@/helpers/config";
import { getState } from "@/stores";
import { LSPFactory } from "@lukso/lsp-factory.js";

jest.mock("@lukso/lsp-factory.js", () => ({
  LSPFactory: jest.fn(),
}));
jest.mock("@/stores", () => ({
  getState: jest.fn().mockReturnValue(22),
}));

describe("can produce LSP Factory", () => {
  let lspFactory: any;
  beforeAll(async () => {
    lspFactory = await useLspFactory();
  });

  it("can call correct parameters", async () => {
    expect(LSPFactory).toBeCalledWith(NETWORK_URL, {
      deployKey: PRIVATE_KEY,
      chainId: 22,
    });
  });

  it("should return null for empty chain id", async () => {
    (getState as jest.Mock).mockReturnValue(undefined);
    lspFactory = await useLspFactory();
    expect(lspFactory).toBe(null);
  });
});
