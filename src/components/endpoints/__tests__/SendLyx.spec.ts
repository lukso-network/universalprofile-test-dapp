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
      "The transaction was successful"
    );
    expect(mockSendTransaction).toBeCalledWith({
      from: "0x517216362D594516c6f96Ee34b2c502d65B847E4",
      to: "0x7367C96553Ed4C44E6962A38d8a0b5f4BE9F6298",
      value: "2000000000000000000",
      gas: 5000000,
      gasPrice: "1000000000",
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
      "The transaction was successful"
    );
    expect(mockSendTransaction).toBeCalledWith({
      data: "0x44c028fe000000000000000000000000000000000000000000000000000000000000000000000000000000000000000052581Cfc2586cA3a5d3C9eA2235738FE375f918e0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000644e3e6e9c0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000140b8bec57d7b5ff0dbd9e9acd0a47dfeb0101e1a203766f5ccab00445fbf39e900000000000000000000000000000000000000000000000000000000",
      from: "0x517216362D594516c6f96Ee34b2c502d65B847E4",
      to: "0x7367C96553Ed4C44E6962A38d8a0b5f4BE9F6298",
      value: "2000000000000000000",
      gas: 5000000,
      gasPrice: "1000000000",
    });
  });
});
