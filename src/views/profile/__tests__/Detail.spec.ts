import Detail from "@/views/profile/Detail.vue";
import { render, waitFor, fireEvent } from "@testing-library/vue";

const mockFetchProfile = jest.fn();
const mockFetch = jest.fn();
const mockIsAddress = jest.fn();
const mockPush = jest.fn();
const mockUseRoute = jest.fn();

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
  useRoute: () => mockUseRoute(),
  useRouter: jest.fn().mockImplementation(() => ({
    push: (val: string) => mockPush(val),
  })),
}));

beforeAll(() => {
  window.fetch = mockFetch;
  mockUseRoute.mockImplementation(() => ({
    params: {
      address: "123",
    },
  }));
  mockIsAddress.mockReturnValue(false);
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
  mockUseRoute.mockReturnValue({
    params: {
      address: "1234",
    },
  });
  render(Detail);
  expect(mockFetch).toBeCalledWith("https://2eff.lukso.dev/ipfs/1234");
});

test("cannot call ipfs server if ipfs address/hash is empty", () => {
  mockUseRoute.mockReturnValue({
    params: {
      address: "",
    },
  });
  mockFetch.mockClear();
  render(Detail);
  expect(mockFetch).not.toBeCalled();
});

test("can call data from cache if address is valid", async () => {
  mockUseRoute.mockReturnValue({
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
  mockUseRoute.mockReturnValue({
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

test("can display profile not found", async () => {
  mockUseRoute.mockReturnValue({
    params: {
      address: "1234-not-found",
    },
  });
  mockFetch.mockRejectedValue(new Error("Failed to fetch"));
  mockIsAddress.mockReturnValue(false);
  const screen = render(Detail);
  await waitFor(() => {
    expect(screen.getByText("Failed to fetch")).toBeDefined();
  });
});

test("can display notification if no address is searched", async () => {
  mockIsAddress.mockReturnValue(false);
  const screen = render(Detail);
  await fireEvent.update(screen.getByTestId("search-address-hash"), "");
  await fireEvent.click(screen.getByText("Search"));
  expect(mockPush).not.toBeCalled();
  expect(screen.getByText("Please enter valid hash or address")).toBeDefined();
});

test("can change route if address is searched", async () => {
  mockIsAddress.mockReturnValue(false);
  const screen = render(Detail);
  await fireEvent.update(
    screen.getByTestId("search-address-hash"),
    "123-searched-address"
  );
  await fireEvent.click(screen.getByText("Search"));
  await waitFor(() => {
    expect(mockPush).toBeCalledWith("/profiles/123-searched-address");
  });
});

test("can display notification if error is thrown", async () => {
  mockIsAddress.mockReturnValue(true);
  mockFetchProfile.mockRejectedValue(new Error("Fetch profile failed"));
  const screen = render(Detail);
  await fireEvent.update(
    screen.getByTestId("search-address-hash"),
    "throw-error-hash"
  );
  await fireEvent.click(screen.getByText("Search"));
  expect(screen.getByText("Fetch profile failed")).toBeDefined();
});
