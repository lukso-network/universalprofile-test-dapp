import Assets from "../Assets.vue";
import { render, fireEvent, waitFor } from "@testing-library/vue";
import { setState } from "@/stores";

const mockContract = jest.fn();

jest.mock("@/compositions/useWeb3", () => ({
  __esModule: true,
  default: () => ({
    contract: () => ({
      deploy: () => ({
        send: () => ({
          on: () => ({
            options: {
              address: "0x7367C96553Ed4C44E6962A38d8a0b5f4BE9F6298",
            },
            methods: {
              mint: () => ({
                send: () => ({
                  on: () => jest.fn(),
                }),
              }),
            },
          }),
        }),
      }),
    }),
  }),
}));

test("can create token", async () => {
  setState("isConnected", true);
  const utils = render(Assets);

  await fireEvent.click(utils.getByTestId("create"));

  await waitFor(() => {
    expect(utils.getByTestId("notification").innerHTML).toContain(
      "Token created"
    );
    expect(utils.getByTestId("token-address").innerHTML).toContain(
      "0x7367C96553Ed4C44E6962A38d8a0b5f4BE9F6298"
    );
  });
});

test("can mint token", async () => {
  const utils = render(Assets);

  await fireEvent.click(utils.getByTestId("create"));
  await fireEvent.click(utils.getByTestId("mint"));

  await waitFor(() => {
    expect(utils.getByTestId("notification").innerHTML).toContain(
      "Token minted"
    );
  });
});
