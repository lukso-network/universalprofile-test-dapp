import Deploy from "@/views/profile/Deploy.vue";
import { render, waitFor, fireEvent } from "@testing-library/vue";

const mockDeployUniversalProfile = jest.fn();

jest.mock("@/compositions/useLspFactory", () => ({
  __esModule: true,
  useLspFactory: () => ({
    deployUniversalProfile: mockDeployUniversalProfile,
  }),
}));

describe("Deploy Component", () => {
  test("can render deploy component", () => {
    const { getByTestId } = render(Deploy);
    const deployTitle = getByTestId("deploy-title");
    expect(deployTitle).toBeTruthy();
  });

  test("can deploy a profile", async () => {
    const { getByTestId } = render(Deploy);
    const deployButton = getByTestId("deploy-button");

    await fireEvent.click(deployButton);

    await waitFor(async () => {
      expect(mockDeployUniversalProfile).toHaveBeenCalledTimes(1);
    });
  });
});
