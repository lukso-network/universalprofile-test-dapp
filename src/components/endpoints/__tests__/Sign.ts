import Sign from "../Sign.vue";
import { render, fireEvent, waitFor } from "@testing-library/vue";
import { setState } from "@/stores";
import { Contract } from "web3-eth-contract";

let mockSign = jest.fn();
let mockRecover = jest.fn();
let mockCall = jest.fn();
jest.mock("@/compositions/useWeb3", () => ({
  __esModule: true,
  default: () => ({
    sign: (message: string, address: string) => mockSign(message, address),
    recover: (message: string, signature: string) =>
      mockRecover(message, signature),
  }),
}));

window.erc725Account = {
  methods: {
    isValidSignature: () => ({
      call: () => mockCall(),
    }),
  },
} as Contract;

beforeEach(() => {
  jest.resetAllMocks();
});

test("can sign message", async () => {
  mockSign = jest.fn().mockReturnValue({
    signature: "0x123",
    address: "0x321",
  });
  setState("address", "0x517216362D594516c6f96Ee34b2c502d65B847E4");
  const utils = render(Sign);

  await fireEvent.click(utils.getByTestId("sign"));

  await waitFor(() => {
    expect(utils.getByTestId("notification").innerHTML).toContain(
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
    expect(utils.getByTestId("signature").innerHTML).toContain("0x123");
    expect(utils.getByTestId("sign-eoa").innerHTML).toContain("0x321");
  });
});

test("can recovery message", async () => {
  mockSign = jest.fn().mockReturnValue({
    signature: "0x123",
    address: "0x321",
  });
  mockRecover = jest.fn().mockReturnValue("0x321");
  setState("address", "0x517216362D594516c6f96Ee34b2c502d65B847E4");
  const utils = render(Sign);

  await fireEvent.click(utils.getByTestId("sign"));
  await fireEvent.click(utils.getByTestId("recover"));

  await waitFor(() => {
    expect(utils.getByTestId("notification").innerHTML).toContain(
      "Recover was successful"
    );
    expect(mockRecover).toBeCalledWith("sign message", "0x123");
    expect(mockRecover).toReturnWith("0x321");
    expect(utils.getByTestId("recovery-eoa").innerHTML).toContain("0x321");
  });
});

test("can verify signature", async () => {
  mockSign = jest.fn().mockReturnValue({
    signature: "0x123",
    address: "0x321",
  });
  mockCall = jest.fn().mockReturnValue("0x1626ba7e");
  setState("address", "0x517216362D594516c6f96Ee34b2c502d65B847E4");
  const utils = render(Sign);

  await fireEvent.click(utils.getByTestId("sign"));
  await fireEvent.click(utils.getByTestId("validate-signature"));

  await waitFor(() => {
    expect(utils.getByTestId("notification").innerHTML).toContain(
      "Signature validated successfully"
    );
    expect(mockCall).toBeCalledTimes(1);
    expect(mockCall).toReturnWith("0x1626ba7e");
    expect(utils.getByTestId("magic-value").innerHTML).toContain("0x1626ba7e");
  });
});
