import useLspFactory from "@/compositions/useLspFactory";
import { LSPFactory } from "@lukso/lsp-factory.js";

jest.mock("@lukso/lsp-factory.js", () => ({
  LSPFactory: jest.fn(),
}));

describe("can produce LSP Factory", () => {
  let lspFactory: any;
  beforeAll(async () => {
    window.ethereum = {};
    useLspFactory();
  });

  it("should be called with window.ethereum", async () => {
    expect(LSPFactory).toBeCalledWith({});
  });

  it("should return null for empty chain id", async () => {
    window.ethereum = undefined;
    expect(useLspFactory).toThrow("Extension not installed");
  });
});
