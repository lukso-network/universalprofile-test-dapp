import { DEFAULT_NETWORK_CONFIG } from "@/helpers/config";
import { createBlockScoutLink } from "@/utils/createBlockScoutLink";

test("createBlockScoutLink(): returns correct blockscout link", () => {
  const link = createBlockScoutLink("ABC");
  expect(link).toBe(
    `https://explorer.execution.l16.lukso.network/tx/ABC/internal-transactions`
  );
});
