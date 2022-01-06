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
      "No from address"
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

test("can send data with permissions", async () => {
  setState("address", "0x517216362D594516c6f96Ee34b2c502d65B847E4");

  const utils = render(SetData);

  await fireEvent.click(utils.getByTestId("setPermissions"));

  await waitFor(() => {
    expect(utils.getByTestId("notification").innerHTML).toContain(
      "Set permissions"
    );
  });
});

test("can see error for set permissions when no from address", async () => {
  setState("address", undefined);

  const utils = render(SetData);

  await fireEvent.click(utils.getByTestId("setPermissions"));

  await waitFor(() => {
    expect(utils.getByTestId("notification").innerHTML).toContain(
      "No from address"
    );
  });
});

test("can see set permission error from send function", async () => {
  setState("address", "0x517216362D594516c6f96Ee34b2c502d65B847E4");
  mockSend = jest.fn().mockImplementation(() => {
    throw new Error("Send error");
  });

  const utils = render(SetData);

  await fireEvent.click(utils.getByTestId("setPermissions"));

  await waitFor(() => {
    expect(utils.getByTestId("notification").innerHTML).toContain("Send error");
  });
});
