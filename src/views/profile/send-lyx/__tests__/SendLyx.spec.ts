import SendLyx from "../SendLyx.vue";
import { render, fireEvent, waitFor } from "@testing-library/vue";
import { setState } from "@/stores";

jest.mock("@/compositions/useErc725", () => ({
  __esModule: true,
  default: () => ({
    fetchProfile() {
      return {
        LSP3Profile: {
          name: "test",
          description: "Lorem ipsum",
          profileImage: [
            {
              width: 600,
              height: 350,
              hashFunction: "keccak256(bytes)",
              hash: "0x123..",
              url: "ipfs://QmPLq_variant_1",
            },
            {
              width: 600,
              height: 350,
              hashFunction: "keccak256(bytes)",
              hash: "0x123..",
              url: "ipfs://QmPLq_variant_2",
            },
            {
              width: 600,
              height: 350,
              hashFunction: "keccak256(bytes)",
              hash: "0x123..",
              url: "ipfs://QmPLq_variant_3",
            },
            {
              width: 320,
              height: 186,
              hashFunction: "keccak256(bytes)",
              hash: "0x123..",
              url: "ipfs://QmPLq_variant_4",
            },
            {
              width: 180,
              height: 105,
              hashFunction: "keccak256(bytes)",
              hash: "0x123..",
              url: "ipfs://QmPLq_variant_5",
            },
          ],
        },
      };
    },
  }),
}));

const mockGetBalance = jest.fn().mockReturnValue(10);
jest.mock("@/compositions/useEthereumRpc", () => ({
  __esModule: true,
  default: () => ({
    getBalance: () => mockGetBalance(),
  }),
}));

test("can see empty state when no extension installed", async () => {
  const utils = render(SendLyx);

  expect(utils.getByTestId("empty-state")).toBeTruthy();
});

test("can see provider connect message", async () => {
  window.ethereum = {};
  const utils = render(SendLyx);

  expect(utils.queryByTestId("empty-state")).toBeFalsy();
  expect(utils.getByTestId("provider-message")).toBeTruthy();
});

test("can send lyx", async () => {
  window.ethereum = {};
  setState("address", "0x7367C96553Ed4C44E6962A38d8a0b5f4BE9F6298");
  setState("isConnected", true);
  const utils = render(SendLyx);

  await fireEvent.update(utils.getByTestId("amount"), "2");
  await fireEvent.update(
    utils.getByTestId("search"),
    "0x7367C96553Ed4C44E6962A38d8a0b5f4BE9F6298"
  );
  await fireEvent.keyUp(utils.getByTestId("search"));
  await fireEvent.click(utils.getByTestId("send"));

  expect(utils.getByTestId("notification").innerHTML).toContain(
    "You successfully send 2 LYX"
  );
  expect(utils.queryByTestId("amount-error")).toBeFalsy();
  expect(utils.queryByTestId("error")).toBeFalsy();
});

test("can see missing amount error", async () => {
  window.ethereum = {};
  setState("address", "0x7367C96553Ed4C44E6962A38d8a0b5f4BE9F6298");
  setState("isConnected", true);
  const utils = render(SendLyx);

  await fireEvent.click(utils.getByTestId("send"));

  expect(utils.getByTestId("notification").innerHTML).toContain(
    "There was some issue in your form"
  );
  expect(utils.getByTestId("amount-error").innerHTML).toContain(
    "Amount is missing"
  );
  expect(utils.getByTestId("error").innerHTML).toContain("Receiver is missing");
});
