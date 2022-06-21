import Search from "../Search.vue";
import { render, fireEvent, waitFor } from "@testing-library/vue";

const mockFetchData = jest.fn().mockReturnValue({
  value: {
    LSP3Profile: {
      name: "test",
      description: "Lorem ipsum",
      profileImage: [
        {
          width: 600,
          height: 350,
          hashFunction: "keccak256(bytes)",
          hash: "0x123..",
          url: "ipfs://QmPLq_variant_1",
        },
        {
          width: 600,
          height: 350,
          hashFunction: "keccak256(bytes)",
          hash: "0x123..",
          url: "ipfs://QmPLq_variant_2",
        },
        {
          width: 600,
          height: 350,
          hashFunction: "keccak256(bytes)",
          hash: "0x123..",
          url: "ipfs://QmPLq_variant_3",
        },
        {
          width: 320,
          height: 186,
          hashFunction: "keccak256(bytes)",
          hash: "0x123..",
          url: "ipfs://QmPLq_variant_4",
        },
        {
          width: 180,
          height: 105,
          hashFunction: "keccak256(bytes)",
          hash: "0x123..",
          url: "ipfs://QmPLq_variant_5",
        },
      ],
    },
  },
});

jest.mock("@erc725/erc725.js", () => {
  return {
    ERC725: jest.fn().mockImplementation(() => {
      return {
        fetchData: () => mockFetchData(),
      };
    }),
  };
});

test("can search profile", async () => {
  const utils = render(Search);

  expect(utils.queryByTestId("error")).not.toBeInTheDocument();

  await fireEvent.update(
    utils.getByTestId("search"),
    "0x84955297Ee819476978d9DE18D0Fa579268c2F7f"
  );
  await fireEvent.keyUp(utils.getByTestId("search"));

  await waitFor(() => {
    expect(utils.queryByTestId("error")).not.toBeInTheDocument();
    expect(utils.queryByTestId("name")).toHaveTextContent("@test");
    expect(utils.emitted()["update"]).toStrictEqual([
      ["0x84955297Ee819476978d9DE18D0Fa579268c2F7f"],
    ]);
  });
});

test("can see invalid address error", async () => {
  const utils = render(Search);

  expect(utils.queryByTestId("error")).not.toBeInTheDocument();

  await fireEvent.update(utils.getByTestId("search"), "0x123");
  await fireEvent.keyUp(utils.getByTestId("search"));

  expect(utils.queryByTestId("error")).not.toBeInTheDocument();
  expect(utils.queryByTestId("name")).not.toBeInTheDocument();
  expect(utils.emitted()["error"]).toBeTruthy();
  expect(utils.emitted()["error"]).toStrictEqual([
    [null],
    ["Address not valid"],
  ]);
});
