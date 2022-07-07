import Sign from "../Sign.vue";
import { render, fireEvent, waitFor, screen } from "@testing-library/vue";
import { setState } from "@/stores";
import { Contract } from "web3-eth-contract";

const mockSign = jest.fn();
const mockRecover = jest.fn();
const mockValidSignatureCall = jest.fn();
const mockHashMessage = jest.fn();

jest.mock("@/compositions/useWeb3", () => ({
  __esModule: true,
  default: () => ({
    sign: (message: string, address: string) => mockSign(message, address),
    recover: (message: string, signature: string) =>
      mockRecover(message, signature),
    getWeb3: () => ({
      eth: {
        accounts: {
          hashMessage: () => mockHashMessage(),
        },
      },
    }),
  }),
}));

window.erc725Account = {
  methods: {
    isValidSignature: () => ({
      call: () => mockValidSignatureCall(),
    }),
  },
} as Contract;

beforeEach(() => {
  jest.resetAllMocks();
});

test("can sign message", async () => {
  mockSign.mockReturnValue({
    signature: "0x123",
    address: "0x321",
  });
  setState("address", "0x517216362D594516c6f96Ee34b2c502d65B847E4");
  render(Sign);

  await fireEvent.click(screen.getByTestId("sign"));

  await waitFor(() => {
    expect(screen.getByTestId("notification").innerHTML).toContain(
      "Message signed successfully"
    );
    expect(mockSign).toBeCalledWith(
      "sign message",
      "0x517216362D594516c6f96Ee34b2c502d65B847E4"
    );
    expect(mockSign).toReturnWith({
      signature: "0x123",
      address: "0x321",
    });
    expect(screen.getByTestId("signature").innerHTML).toContain("0x123");
    expect(screen.getByTestId("sign-eoa").innerHTML).toContain("0x321");
  });
});

test("can recovery message", async () => {
  mockSign.mockReturnValue({
    signature: "0x123",
    address: "0x321",
  });
  mockRecover.mockReturnValue("0x321");
  setState("address", "0x517216362D594516c6f96Ee34b2c502d65B847E4");
  render(Sign);

  await fireEvent.click(screen.getByTestId("sign"));
  await fireEvent.click(screen.getByTestId("recover"));

  await waitFor(() => {
    expect(screen.getByTestId("notification").innerHTML).toContain(
      "Recover was successful"
    );
    expect(mockRecover).toBeCalledWith("sign message", "0x123");
    expect(mockRecover).toReturnWith("0x321");
    expect(screen.getByTestId("recovery-eoa").innerHTML).toContain("0x321");
  });
});

test("can verify signature", async () => {
  mockSign.mockReturnValue({
    signature: "0x123",
    address: "0x321",
  });
  mockValidSignatureCall.mockReturnValue("0x1626ba7e");
  mockHashMessage.mockReturnValue("0x1626ba7e");
  setState("address", "0x517216362D594516c6f96Ee34b2c502d65B847E4");
  render(Sign);

  await fireEvent.click(screen.getByTestId("sign"));
  await fireEvent.click(screen.getByTestId("validate-signature"));

  await waitFor(() => {
    expect(screen.getByTestId("notification").innerHTML).toContain(
      "Signature validated successfully"
    );
    expect(mockValidSignatureCall).toBeCalledTimes(1);
    expect(mockValidSignatureCall).toReturnWith("0x1626ba7e");
    expect(screen.getByTestId("magic-value").innerHTML).toContain("0x1626ba7e");
  });
});
