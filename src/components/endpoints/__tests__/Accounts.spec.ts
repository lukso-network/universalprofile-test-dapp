import Accounts from "../Accounts.vue";
import { render, fireEvent, waitFor } from "@testing-library/vue";
import { useState } from "@/stores";

const mockSetupProvider = jest.fn();
const mockEnableProvider = jest.fn();
const mockResetProvider = jest.fn();
let mockGetProvider = jest.fn();

jest.mock("@/compositions/useWalletConnect", () => ({
  __esModule: true,
  default: () => ({
    resetProvider: () => mockResetProvider(),
    setupProvider: () => mockSetupProvider(),
    enableProvider: () => mockEnableProvider(),
    getProvider: () => mockGetProvider(),
  }),
}));

const mockAccounts = jest.fn();
const mockGetBalance = jest.fn();
let mockRequestAccounts = jest.fn();
jest.mock("@/compositions/useEthereumRpc", () => ({
  __esModule: true,
  default: () => ({
    accounts: () => mockAccounts(),
    getBalance: () => mockGetBalance(),
    requestAccounts: () => mockRequestAccounts(),
  }),
}));

test("can connect to wallet connect", async () => {
  mockGetProvider = jest.fn().mockReturnValue({
    wc: {
      connected: false,
    },
  });

  const utils = render(Accounts);

  await fireEvent.click(utils.getByTestId("connect-wc"));

  await waitFor(() => {
    expect(mockSetupProvider).toBeCalledTimes(1);
    expect(mockEnableProvider).toBeCalledTimes(1);
    expect(utils.getByTestId("notification").innerHTML).toContain(
      "Connected to address"
    );
  });
});

test("can connect to browser extension when authorized", async () => {
  mockRequestAccounts = jest
    .fn()
    .mockReturnValue(["0x7367C96553Ed4C44E6962A38d8a0b5f4BE9F6298"]);
  mockGetProvider = jest.fn().mockReturnValue({
    wc: {
      connected: false,
    },
  });

  const utils = render(Accounts);

  await fireEvent.click(utils.getByTestId("connect-extension"));

  await waitFor(() => {
    expect(mockRequestAccounts).toBeCalledTimes(1);
    expect(utils.getByTestId("notification").innerHTML).toContain(
      "Connected to address"
    );
  });
});

test("can disconnect from browser extension", async () => {
  const { setConnected } = useState();
  setConnected(
    "0x7367C96553Ed4C44E6962A38d8a0b5f4BE9F6298",
    "browserExtension"
  );

  const utils = render(Accounts);

  expect(utils.getByTestId("connect-extension")).toBeDisabled();
  expect(utils.getByTestId("disconnect")).not.toBeDisabled();

  await fireEvent.click(utils.getByTestId("disconnect"));

  expect(utils.getByTestId("connect-extension")).not.toBeDisabled();
  expect(utils.getByTestId("disconnect")).toBeDisabled();
  expect(utils.getByTestId("notification").innerHTML).toContain("Disconnected");
});
