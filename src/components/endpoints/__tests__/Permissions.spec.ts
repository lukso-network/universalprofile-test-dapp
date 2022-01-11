import Permissions from "../Permissions.vue";
import { render, fireEvent, waitFor } from "@testing-library/vue";
import { setState } from "@/stores";

let mockSend = jest.fn();
let mockContract = jest.fn();

jest.mock("@/compositions/useWeb3", () => ({
  __esModule: true,
  default: () => ({
    contract: () => mockContract(),
  }),
}));

beforeEach(() => {
  jest.resetAllMocks();
});

test("can update permissions for given address", async () => {
  setState("address", "0x517216362D594516c6f96Ee34b2c502d65B847E4");

  mockSend = jest.fn().mockImplementation(() => ({
    on: () => ({
      once: () => jest.fn(),
    }),
  }));
  mockContract = jest.fn().mockImplementation(() => ({
    methods: {
      setData: (key: any[], value: any[]) => ({
        send: () => mockSend(key, value),
      }),
    },
  }));

  const utils = render(Permissions);

  await fireEvent.click(utils.getByTestId("CHANGEOWNER"));
  await fireEvent.click(utils.getByTestId("setPermissions"));

  await waitFor(() => {
    expect(utils.getByTestId("notification").innerHTML).toContain(
      "Set permissions"
    );
    expect(mockSend).toBeCalledWith(
      ["0x4b80742d0000000082ac0000af3bf2ffb025098b79caddfbdd113b3681817744"],
      ["0x0000000000000000000000000000000000000000000000000000000000000001"]
    );
  });
});

test("can see error for set permissions when no given address", async () => {
  setState("address", undefined);

  const utils = render(Permissions);

  await fireEvent.click(utils.getByTestId("setPermissions"));

  await waitFor(() => {
    expect(utils.getByTestId("notification").innerHTML).toContain(
      "No valid address"
    );
  });
});

test("can see set permission error from send function", async () => {
  setState("address", "0x517216362D594516c6f96Ee34b2c502d65B847E4");

  mockContract = jest.fn().mockImplementation(() => ({
    methods: {
      setData: () => ({
        send: () =>
          jest.fn().mockImplementation(() => {
            throw new Error("Send error");
          })(),
      }),
    },
  }));

  const utils = render(Permissions);

  await fireEvent.click(utils.getByTestId("setPermissions"));

  await waitFor(() => {
    expect(utils.getByTestId("notification").innerHTML).toContain("Send error");
  });
});
