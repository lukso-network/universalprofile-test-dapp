import Connect from "../Connect.vue";
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

const mockSetupWeb3 = jest.fn();

jest.mock("@/compositions/useWeb3", () => ({
  __esModule: true,
  default: () => ({
    setupWeb3: () => mockSetupWeb3(),
    getChainId: () => 22,
  }),
}));

let mockAccounts = jest.fn();
let mockGetBalance = jest.fn();
let mockRequestAccounts = jest.fn();
jest.mock("@/compositions/useEthereumRpc", () => ({
  __esModule: true,
  default: () => ({
    accounts: () => mockAccounts(),
    getBalance: () => mockGetBalance(),
    requestAccounts: () => mockRequestAccounts(),
  }),
}));

beforeEach(() => {
  const { setDisconnected } = useState();
  setDisconnected();
  jest.resetAllMocks();
});

test("can connect to wallet connect", async () => {
  mockGetProvider = jest.fn().mockReturnValue({
    wc: {
      connected: false,
    },
  });

  const utils = render(Connect);

  expect(mockSetupProvider).toBeCalledTimes(1);

  await fireEvent.click(utils.getByTestId("connect-wc"));

  expect(mockSetupProvider).toBeCalledTimes(2);
  expect(mockEnableProvider).toBeCalledTimes(1);
});

test("can disconnect from wallet connect", async () => {
  mockGetProvider = jest.fn().mockReturnValue({
    wc: {
      connected: true,
    },
  });
  mockGetBalance = jest.fn().mockReturnValue("2");
  const { setConnected } = useState();
  setConnected("0x8e54b33F8d42E59c0B4Cf02e6457CF8bb6a71094", "walletConnect");

  const utils = render(Connect);

  expect(mockSetupProvider).toBeCalledTimes(1);
  expect(utils.getByTestId("address").innerHTML).toContain("0x8e54b3...");

  await fireEvent.click(utils.getByTestId("disconnect"));

  expect(mockEnableProvider).toBeCalledTimes(1);
  expect(utils.queryByTestId("address")).toBeFalsy();
});

test("can connect to browser extension when authorized", async () => {
  mockAccounts = jest
    .fn()
    .mockResolvedValue("0xD8B0b80Fa7938f2F841b314d8b6052EAe97db826");
  mockGetProvider = jest.fn().mockReturnValue({
    wc: {
      connected: false,
    },
  });
  mockGetBalance = jest.fn().mockReturnValue("2");

  const utils = render(Connect);

  await fireEvent.click(utils.getByTestId("connect-extension"));

  await waitFor(() => {
    expect(mockSetupWeb3).toBeCalledTimes(1);
    expect(mockAccounts).toBeCalledTimes(1);
    expect(utils.getByTestId("balance").innerHTML).toContain("2 LYX");
    expect(utils.getByTestId("address").innerHTML).toContain("0xD8B0b8...");
  });
});

test("can connect to browser extension when not authorized", async () => {
  mockAccounts = jest.fn().mockResolvedValue(undefined);
  mockRequestAccounts = jest
    .fn()
    .mockReturnValue(["0x7367C96553Ed4C44E6962A38d8a0b5f4BE9F6298"]);
  mockGetProvider = jest.fn().mockReturnValue({
    wc: {
      connected: false,
    },
  });
  mockGetBalance = jest.fn().mockReturnValue("3");

  const utils = render(Connect);

  await fireEvent.click(utils.getByTestId("connect-extension"));

  await waitFor(() => {
    expect(mockRequestAccounts).toBeCalled();
    expect(utils.getByTestId("balance").innerHTML).toContain("3 LYX");
    expect(utils.getByTestId("address").innerHTML).toContain("0x7367C9...");
  });
});
