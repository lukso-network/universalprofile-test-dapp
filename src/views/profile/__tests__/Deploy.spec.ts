import Deploy from "@/views/profile/Deploy.vue";
import { render, waitFor, fireEvent } from "@testing-library/vue";

// const mockDeployUniversalProfile = jest.fn();

// jest.mock("@/compositions/useLspFactory", () => ({
//   useLspFactory: () => ({
//     deployUniversalProfile: mockDeployUniversalProfile,
//   }),
// }));

test("can render deploy component", async () => {
  const { getByText } = render(Deploy);
  const deployTitle = getByText("Deploy Profile");
  expect(deployTitle).toBeInTheDocument();
});

//   test("can deploy a profile", async () => {
//     const { getByTestId } = render(Deploy);
//     const deployButton = getByTestId("deploy-button");

//     await fireEvent.click(deployButton);

//     await waitFor(async () => {
//       expect(mockDeployUniversalProfile).toHaveBeenCalledTimes(1);
//     });
//   });
