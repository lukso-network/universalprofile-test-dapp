import { DEFAULT_IPFS_URL } from "@/helpers/config";
import { ERC725, ERC725JSONSchema } from "@erc725/erc725.js";
import { Permissions } from "@erc725/erc725.js/build/main/src/types/Method";
import { DecodeDataOutput } from "@erc725/erc725.js/build/main/src/types/decodeData";
import Web3 from "web3";

const provider = new Web3.providers.HttpProvider(
  "https://rpc.l14.lukso.network"
);
const config = {
  ipfsGateway: DEFAULT_IPFS_URL,
};
const schema = [
  {
    name: "LSP3Profile",
    key: "0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5",
    keyType: "Singleton",
    valueContent: "JSONURL",
    valueType: "bytes",
  },
] as Array<ERC725JSONSchema>;

const getInstance = (address: string) => {
  const erc725 = new ERC725(schema, address, provider, config);

  return erc725;
};

const fetchProfile = async (
  address: string
): Promise<DecodeDataOutput["value"]> => {
  const erc725 = getInstance(address);
  const profile = await erc725.fetchData("LSP3Profile");

  return profile.value;
};

const encodePermissions = (permissions: Permissions) => {
  return ERC725.encodePermissions(permissions);
};

const decodePermissions = (permissionHex: string) => {
  return ERC725.decodePermissions(permissionHex);
};

export default function useErc725(): {
  fetchProfile: (address: string) => Promise<DecodeDataOutput["value"]>;
  getInstance: (address: string) => ERC725;
  encodePermissions: (permissions: Permissions) => string;
  decodePermissions: (permissionHex: string) => Permissions;
} {
  return {
    fetchProfile,
    getInstance,
    encodePermissions,
    decodePermissions,
  };
}
