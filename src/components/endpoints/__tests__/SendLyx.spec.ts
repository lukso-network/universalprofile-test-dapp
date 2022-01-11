import SendLyx from "../SendLyx.vue";
import { render, fireEvent, waitFor } from "@testing-library/vue";
import { setState } from "@/stores";

const mockGetBalance = jest.fn();
const mockSendTransaction = jest.fn();
jest.mock("@/compositions/useEthereumRpc", () => ({
  __esModule: true,
  default: () => ({
    getBalance: () => mockGetBalance(),
    sendTransaction: (params: any) => mockSendTransaction(params),
  }),
}));

test("can send lyx transaction", async () => {
  setState("address", "0x517216362D594516c6f96Ee34b2c502d65B847E4");

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
    expect(mockSendTransaction).toBeCalledWith({
      from: "0x517216362D594516c6f96Ee34b2c502d65B847E4",
      to: "0x7367C96553Ed4C44E6962A38d8a0b5f4BE9F6298",
      value: "2000000000000000000",
    });
  });
});

test("can send lyx transaction with data", async () => {
  setState("address", "0x517216362D594516c6f96Ee34b2c502d65B847E4");

  const utils = render(SendLyx);

  await fireEvent.update(utils.getByTestId("amount"), "2");
  await fireEvent.update(
    utils.getByTestId("to"),
    "0x7367C96553Ed4C44E6962A38d8a0b5f4BE9F6298"
  );
  await fireEvent.click(utils.getByTestId("hasData"));
  await fireEvent.click(utils.getByTestId("send"));

  await waitFor(() => {
    expect(utils.getByTestId("notification").innerHTML).toContain(
      "You successfully send 2 LYX"
    );
    expect(mockSendTransaction).toBeCalledWith({
      data: "0xa9059cbb000000000000000000000000def3325cce6f7289a583ff735eaee52611333fad0000000000000000000000000000000000000000000015d5cb65e4b714308000",
      from: "0x517216362D594516c6f96Ee34b2c502d65B847E4",
      to: "0x7367C96553Ed4C44E6962A38d8a0b5f4BE9F6298",
      value: "2000000000000000000",
    });
  });
});
