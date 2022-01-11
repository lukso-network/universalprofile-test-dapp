import SetData from "../SetData.vue";
import { render, fireEvent, waitFor } from "@testing-library/vue";
import { setState } from "@/stores";

let mockSend = jest.fn();
jest.mock("@/compositions/useWeb3", () => ({
  __esModule: true,
  default: () => ({
    contract: () => ({
      methods: {
        setData: (key: any[], value: any[]) => ({
          send: () => mockSend(key, value),
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
    expect(mockSend).toBeCalledWith(
      ["0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5"],
      [
        "0x6f357c6a70546a2accab18748420b63c63b5af4cf710848ae83afc0c51dd8ad17fb5e8b3697066733a2f2f516d65637247656a555156587057347a53393438704e76636e51724a314b69416f4d36626466725663575a736e35",
      ]
    );
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
