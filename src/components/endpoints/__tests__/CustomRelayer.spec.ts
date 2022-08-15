import CustomRelayer from "../CustomRelayer.vue";
import { render, fireEvent, screen } from "@testing-library/vue";
import { getState } from "@/stores";

const data = {
  name: "my test relayer",
  apiUrl: "https://relayer.l16.staging.lukso.dev/api/v3/",
  chainIds: [getState("chainId")],
};

window.ethereum = {
  request: jest.fn(),
};

const windowSpy = jest.spyOn(window.ethereum, "request");

afterEach(() => {
  windowSpy.mockRestore();
});

test("can add relayer", async () => {
  render(CustomRelayer);

  await fireEvent.update(screen.getByTestId("relayer-name"), data.name);
  await fireEvent.update(screen.getByTestId("relayer-url"), data.apiUrl);
  await fireEvent.click(screen.getByTestId("add-relayer"));

  expect(windowSpy).toHaveBeenCalledWith({
    method: "up_addRelayService",
    params: [data],
  });
});
