import { DEFAULT_NETWORK_CONFIG } from "@/helpers/config";
import { createBlockScoutLink } from "@/utils/createBlockScoutLink";

test("createBlockScoutLink(): returns correct blockscout link", () => {
  expect(createBlockScoutLink("ABC")).toBe(
    `${DEFAULT_NETWORK_CONFIG.blockscout.url}/ABC/internal-transactions`
  );
});
