import { useLspFactory } from "@/compositions/useLspFactory";

test("can produce LSP Factory", async () => {
  const lspFactory = await useLspFactory();

  it("can deploy base contracts", async () => {
    const deployedBaseContract =
      await lspFactory.ProxyDeployer.deployBaseContracts();
    expect(deployedBaseContract.universalProfile.address).toBe(
      expect.stringContaining("0x")
    );
    expect(deployedBaseContract.universalReceiverDelegate.address).toBe(
      expect.stringContaining("0x")
    );
  });

  it("can deploy universal profile", async () => {
    expect(lspFactory.LSP3UniversalProfile).toBe(
      expect.objectContaining({ deploy: expect.anything() })
    );
  });
});
