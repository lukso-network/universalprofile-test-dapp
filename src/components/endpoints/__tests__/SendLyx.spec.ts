import SendLyx from "../SendLyx.vue";
import { render, fireEvent, waitFor } from "@testing-library/vue";
import { setState } from "@/stores";

const mockGetBalance = jest.fn();
const mockSendTransaction = jest.fn();
jest.mock("@/compositions/useEthereumRpc", () => {
  return {
    __esModule: true,
    default: () => ({
      getBalance: () => mockGetBalance(),
      sendTransaction: () => mockSendTransaction(),
    }),
  };
});

test("can send lyx transaction", async () => {
  setState("address", "0x7367C96553Ed4C44E6962A38d8a0b5f4BE9F6298");

  const utils = render(SendLyx);

  await fireEvent.update(utils.getByTestId("amount"), "2");
  await fireEvent.update(
    utils.getByTestId("to"),
    "0x7367C96553Ed4C44E6962A38d8a0b5f4BE9F6298"
  );
  await fireEvent.click(utils.getByTestId("send"));

  await waitFor(() => {
    expect(utils.getByTestId("notification").innerHTML).toContain(
      "You successfully send 2 LYX"
    );
  });
});
