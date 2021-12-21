import { ERC725, ERC725JSONSchema } from "@erc725/erc725.js";
import Web3 from "web3";

const provider = new Web3.providers.HttpProvider(
  "https://rpc.l14.lukso.network"
);
const config = {
  ipfsGateway: "https://ipfs.lukso.network/ipfs/",
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

const fetchProfile = async (address: string): Promise<any> => {
  const erc725 = getInstance(address);
  const profile = await erc725.fetchData("LSP3Profile");

  return profile.LSP3Profile.LSP3Profile;
};

export default function useErc725(): {
  fetchProfile: (address: string) => Promise<any>;
  getInstance: (address: string) => ERC725<any>;
} {
  return {
    fetchProfile,
    getInstance,
  };
}
