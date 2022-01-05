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

const mockSetupWeb3 = jest.fn();

jest.mock("@/compositions/useWeb3", () => ({
  __esModule: true,
  default: () => ({
    setupWeb3: () => mockSetupWeb3(),
    getChainId: () => 22,
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
    .mockReturnValue(["0x83b21Ba5Cb73f4C17E82f2f7E37787b13d924306"]);
  mockGetProvider = jest.fn().mockReturnValue({
    wc: {
      connected: false,
    },
  });

  const utils = render(Accounts);

  await fireEvent.click(utils.getByTestId("connect-extension"));

  await waitFor(() => {
    expect(mockRequestAccounts).toBeCalledTimes(1);
    expect(utils.getByTestId("info").innerHTML).toContain(
      "Connected to address"
    );
    expect(utils.getByTestId("chain").innerHTML).toContain("22 (0x16)");
  });
});

test("can disconnect from browser extension", async () => {
  window.ethereum = {};
  const { setConnected } = useState();
  setConnected(
    "0x517216362D594516c6f96Ee34b2c502d65B847E4",
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
