import Profile from "../Profile.vue";
import { render } from "@testing-library/vue";

test("can show full profile", () => {
  const profile = {
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
  };
  const address = "0x321";
  const utils = render(Profile, {
    props: {
      profile,
      address,
    },
  });

  expect(utils.getByTestId("identicon")).toHaveAttribute("style");
  expect(utils.getByTestId("profile-image")).toHaveStyle({
    "background-image": "url(https://2eff.lukso.dev/ipfs/QmPLq_variant_5)",
  });
  expect(utils.getByTestId("name")).toHaveTextContent("test");
  expect(utils.getByTestId("address")).toHaveTextContent("0x321");
});

test("can show profile without image", () => {
  const profile = {
    name: "test",
    description: "Lorem ipsum",
  };
  const address = "0x321";
  const utils = render(Profile, {
    props: {
      profile,
      address,
    },
  });

  expect(utils.getByTestId("identicon")).toHaveAttribute("style");
  expect(utils.getByTestId("profile-image")).toHaveStyle({
    "background-image": "url(https://bulma.io/images/placeholders/96x96.png)",
  });
});
