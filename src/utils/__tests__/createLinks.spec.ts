import { createIpfsLink, createBlockScoutLink } from "@/utils/createLinks";

test("createBlockScoutLink(): returns correct blockscout link", () => {
  const link = createBlockScoutLink("ABC");
  expect(link).toBe(
    `https://explorer.execution.l16.lukso.network/tx/ABC/internal-transactions`
  );
});

test("createIpfsLink(): returns correct ipfs link", () => {
  const link = createIpfsLink("ipfs://ABC");
  expect(link).toBe(`https://2eff.lukso.dev/ipfs/ABC`);
});
