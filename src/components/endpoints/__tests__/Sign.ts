import Sign from "../Sign.vue";
import { render, fireEvent, waitFor } from "@testing-library/vue";
import { setState } from "@/stores";

let mockSign = jest.fn();
let mockRecover = jest.fn();
jest.mock("@/compositions/useWeb3", () => ({
  __esModule: true,
  default: () => ({
    sign: (message: string, address: string) => mockSign(message, address),
    recover: (message: string, signature: string) =>
      mockRecover(message, signature),
  }),
}));

beforeEach(() => {
  jest.resetAllMocks();
});

test("can sign message", async () => {
  mockSign = jest.fn().mockReturnValue("0x123");
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
    expect(utils.getByTestId("info").innerHTML).toContain("0x123");
  });
});

test("can recovery message", async () => {
  mockSign = jest.fn().mockReturnValue("0x123");
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
    expect(utils.getByTestId("info").innerHTML).toContain("0x123");
    expect(utils.getByTestId("info").innerHTML).toContain("0x321");
  });
});
