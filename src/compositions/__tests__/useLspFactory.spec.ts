import { useLspFactory } from "@/compositions/useLspFactory";

jest.mock("@lukso/lsp-factory.js", () => ({
  LSPFactory: jest.fn().mockImplementation(() => ({
    ProxyDeployer: {
      deployBaseContracts: () => ({
        universalProfile: {
          address: "0x1",
        },
        universalReceiverDelegate: {
          address: "0x1",
        },
      }),
    },
    LSP3UniversalProfile: {
      deploy: () => "success",
    },
  })),
}));
jest.mock("@/services/provider.service", () => ({
  getSigner: async () => ({
    provider: {
      getNetwork: jest.fn().mockImplementation(async () => ({
        chainId: 22,
      })),
    },
  }),
}));

describe("can produce LSP Factory", () => {
  let lspFactory: any;
  beforeAll(async () => {
    lspFactory = await useLspFactory();
  });

  it("can deploy base contracts", async () => {
    const deployedBaseContract =
      await lspFactory.ProxyDeployer.deployBaseContracts();
    expect(deployedBaseContract.universalProfile.address).toBe("0x1");
    expect(deployedBaseContract.universalReceiverDelegate.address).toBe("0x1");
  });

  it("can deploy universal profile", async () => {
    expect(lspFactory.LSP3UniversalProfile.deploy()).toBe("success");
  });
});
