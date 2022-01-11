import SetData from "../SetData.vue";
import { render, fireEvent, waitFor } from "@testing-library/vue";
import { setState } from "@/stores";

let mockSend = jest.fn();
jest.mock("@/compositions/useWeb3", () => ({
  __esModule: true,
  default: () => ({
    contract: () => ({
      methods: {
        setData: () => ({
          send: () => mockSend(),
        }),
      },
    }),
  }),
}));

beforeEach(() => {
  jest.resetAllMocks();
});

test("can set data", async () => {
  setState("address", "0x517216362D594516c6f96Ee34b2c502d65B847E4");

  mockSend = jest.fn().mockImplementation(() => ({
    on: () => ({
      once: () => jest.fn(),
    }),
  }));

  const utils = render(SetData);

  await fireEvent.click(utils.getByTestId("setData"));

  await waitFor(() => {
    expect(utils.getByTestId("notification").innerHTML).toContain("Set data");
  });
});

test("can see error for set data when no from address", async () => {
  setState("address", undefined);

  const utils = render(SetData);

  await fireEvent.click(utils.getByTestId("setData"));

  await waitFor(() => {
    expect(utils.getByTestId("notification").innerHTML).toContain(
      "No valid address"
    );
  });
});

test("can see set data error from send function", async () => {
  setState("address", "0x517216362D594516c6f96Ee34b2c502d65B847E4");
  mockSend = jest.fn().mockImplementation(() => {
    throw new Error("Send error");
  });

  const utils = render(SetData);

  await fireEvent.click(utils.getByTestId("setData"));

  await waitFor(() => {
    expect(utils.getByTestId("notification").innerHTML).toContain("Send error");
  });
});
