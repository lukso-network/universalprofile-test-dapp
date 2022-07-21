import { render } from "@testing-library/vue";
import Deploy from "@/views/profile/Deploy.vue";

const mockDeployUniversalProfile = jest.fn();
const mockUploadedProfiles = jest.fn(() => [
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

jest.mock("@/helpers/localstorage", () => ({
  getAndPrepareAllIpfsItems: () => mockUploadedProfiles(),
}));

jest.mock("@/compositions/useLspFactory", () => ({
  useLspFactory: jest.fn(() => ({
    deployUniversalProfile: () => mockDeployUniversalProfile(),
  })),
}));

describe("Deploy Component Testing", () => {
  it("renders the component", () => {
    const { getByTestId } = render(Deploy);
    expect(getByTestId("deploy-title")).toBeTruthy();
  });
  it("should render Uploaded profiles", async () => {
    const { getByTestId } = render(Deploy);
    expect(getByTestId("deploy-button")).toBeTruthy();
  });
});
