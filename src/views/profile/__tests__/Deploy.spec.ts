import { fireEvent, render, waitFor } from "@testing-library/vue";
import Deploy from "@/views/profile/Deploy.vue";

const mockDeployUniversalProfile = jest.fn();
const mockGetAndPrepareAllIpfsItems = jest.fn();
const mockPush = jest.fn();

jest.mock("@/helpers/localstorage", () => ({
  getAndPrepareAllIpfsItems: () => mockGetAndPrepareAllIpfsItems(),
}));
jest.mock("vue-router", () => ({
  useRouter: jest.fn(() => ({
    push: (val: unknown) => mockPush(val),
  })),
}));
jest.mock("@/compositions/useLspFactory", () => ({
  useLspFactory: jest.fn(() => ({
    deployUniversalProfile: () => mockDeployUniversalProfile(),
  })),
}));

beforeEach(() => {
  mockGetAndPrepareAllIpfsItems.mockReturnValue([
    {
      url: "ipfs://QmZ3zDELDWSzjyLKxLe5ipM1HKPUvgHVV5c22cnKUc4byk",
      json: {
        LSP3Profile: {
          name: "John",
          description: "Unknown person",
          links: [
            {
              url: "http://lukso.network",
              title: "Lukso test",
            },
            {
              url: "http://lukso.io",
            },
          ],
          profileImage: [
            {
              width: 258,
              height: 195,
              hashFunction: "keccak256(bytes)",
              hash: "0x4c5e66a9fbb0f258d2baa95392a8da1da9731d658abb0fede2ecdc826a69db1a",
              url: "ipfs://QmZ3zDELDWSzjyLKxLe5ipM1HKPUvgHVV5c22cnKUc4byk",
            },
          ],
          backgroundImage: [
            {
              width: 640,
              height: 360,
              hashFunction: "keccak256(bytes)",
              hash: "0x6f08de0d9a0f608ef23aace0485f4d7f7541d6d35ba62c4255c7f6b16d131fa8",
              url: "ipfs://QmT7JiaMBSbVG2hWnS4oM7nFbpuwcKc7zNzs2CcWoGqLBx",
            },
          ],
          tags: ["blockchain", "fashion"],
        },
      },
    },
  ]);
});

test("renders the component", () => {
  const screen = render(Deploy);
  expect(screen.getByTestId("deploy-title")).toBeTruthy();
});

test("should render Uploaded profiles", async () => {
  const screen = render(Deploy);
  expect(screen.getByTestId("deploy-button")).toBeVisible();
  await waitFor(() => {
    expect(
      screen.getByText("QmZ3zDELDWSzjyLKxLe5ipM1HKPUvgHVV5c22cnKUc4byk")
    ).toBeVisible();
  });
});

test("should open modal when deploy is clicked", async () => {
  const screen = render(Deploy);
  const deployButton = screen.getByTestId("deploy-button");
  await fireEvent.click(deployButton);
  await waitFor(() => {
    expect(screen.getByText("Deploy LSP3UniversalProfile")).toBeVisible();
  });
});
