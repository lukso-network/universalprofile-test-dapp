import Detail from "@/views/profile/Detail.vue";
import { render, waitFor } from "@testing-library/vue";
import { useRoute } from "vue-router";

const mockFetchProfile = jest.fn();
const mockFetch = jest.fn();
const mockIsAddress = jest.fn();

jest.mock("@/compositions/useErc725", () => ({
  __esModule: true,
  default: () => ({
    fetchProfile: mockFetchProfile,
  }),
}));
jest.mock("@/compositions/useWeb3", () => ({
  __esModule: true,
  default: () => ({
    isAddress: () => mockIsAddress(),
  }),
}));
jest.mock("vue-router", () => ({
  useRoute: jest.fn().mockImplementation(() => ({
    params: {
      address: "123",
    },
  })),
}));

beforeAll(() => {
  window.fetch = mockFetch;
  mockIsAddress.mockReturnValue(false);
  (useRoute as jest.Mock).mockImplementation(() => ({
    params: {
      address: "123",
    },
  }));
  mockFetchProfile.mockResolvedValue({
    LSP3UniversalProfiles: [{ name: "1234" }],
  });
});

test("can call data from ipfs", async () => {
  mockFetch.mockResolvedValue({
    json: jest.fn(() => ({
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
    })),
  });
  const screen = render(Detail);
  expect(mockFetch).toBeCalledWith("https://2eff.lukso.dev/ipfs/123");
  expect(screen.getByText("Loading...")).toBeDefined();
  await waitFor(() => {
    expect(screen.getByText("IPFS: 123")).toBeDefined();
    expect(screen.getByText("John")).toBeDefined();
    expect(screen.getByText("Unknown person")).toBeDefined();
    expect(screen.getByText("Lukso test")).toBeDefined();
    expect(screen.getByText("http://lukso.io")).toBeDefined();
    expect(screen.getByText("blockchain")).toBeDefined();
    expect(screen.getByText("fashion")).toBeDefined();
  });
});

test("can call data from ipfs if url changes", () => {
  (useRoute as jest.Mock).mockReturnValue({
    params: {
      address: "1234",
    },
  });
  render(Detail);
  expect(mockFetch).toBeCalledWith("https://2eff.lukso.dev/ipfs/1234");
});

test("cannot call ipfs server if ipfs address/hash is empty", () => {
  (useRoute as jest.Mock).mockReturnValue({
    params: {
      address: "",
    },
  });
  mockFetch.mockClear();
  render(Detail);
  expect(mockFetch).not.toBeCalled();
});

test("can call data from cache if address is valid", async () => {
  (useRoute as jest.Mock).mockReturnValue({
    params: {
      address: "1234",
    },
  });
  mockIsAddress.mockReturnValue(true);

  const screen = render(Detail);
  expect(mockFetchProfile).toBeCalledWith("1234");
  await waitFor(() => {
    expect(screen.getByText("ERC725-Cache: 1234")).toBeDefined();
  });
});

test("can display both background image and profile image", async () => {
  (useRoute as jest.Mock).mockReturnValue({
    params: {
      address: "1234",
    },
  });
  mockIsAddress.mockReturnValue(false);
  const screen = render(Detail);
  await waitFor(() => {
    expect(
      screen.getAllByAltText(
        "ipfs://QmZ3zDELDWSzjyLKxLe5ipM1HKPUvgHVV5c22cnKUc4byk"
      )
    ).toBeDefined();
    expect(
      screen.getAllByAltText(
        "ipfs://QmT7JiaMBSbVG2hWnS4oM7nFbpuwcKc7zNzs2CcWoGqLBx"
      )
    ).toBeDefined();
  });
});
