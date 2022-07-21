import Notifications from "../Notification.vue";
import { render, fireEvent } from "@testing-library/vue";

test("can show notification", async () => {
  const notification = {
    message: "Message",
    type: "danger",
  };
  const utils = render(Notifications, {
    props: {
      notification,
    },
  });

  expect(utils.getByTestId("notification")).toHaveClass("is-danger");
  expect(await utils.findByTestId("message")).toHaveTextContent(/^Message$/);
});

test("can trigger hide", async () => {
  const notification = {
    message: "Message",
    type: "danger",
  };
  const utils = render(Notifications, {
    props: {
      notification,
    },
  });

  await fireEvent.click(utils.getByTestId("hide"));

  expect(utils.emitted()["hide"]).toBeTruthy();
});
