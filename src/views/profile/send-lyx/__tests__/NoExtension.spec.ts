import NoExtension from "../NoExtension.vue";
import { render, fireEvent } from "@testing-library/vue";

test("can open extension link", async () => {
  global.open = jest.fn();

  const utils = render(NoExtension);

  expect(utils.queryByTestId("error")).not.toBeInTheDocument();

  await fireEvent.click(utils.getByTestId("button"));

  expect(global.open).toHaveBeenCalledTimes(1);
  expect(global.open).toHaveBeenCalledWith(
    "https://chrome.google.com/webstore/category/extensions?hl=en",
    "_blank"
  );
});
