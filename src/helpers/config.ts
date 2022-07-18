import { NetworkInfo, NetworkType } from "@/interfaces/network";

export const UP_CONNECTED_ADDRESS = "up:connected-address";

export const DEFAULT_IPFS_URL = "https://2eff.lukso.dev/ipfs/";
export const DEFAULT_GAS = 5_000_000;
export const DEFAULT_GAS_PRICE = "10000000000";

export const MAGICVALUE = "0x1626ba7e";

export const DEFAULT_NETWORK: NetworkType = "l16";

export const NETWORKS: { [K in NetworkType]: NetworkInfo } = {
  l16: {
    name: "l16",
    rpc: {
      url: "https://rpc.l16.lukso.network",
    },
    cache: {
      url: "https://erc725cache.l16.lukso.network/graphql",
    },
    ipfs: {
      url: "https://2eff.lukso.dev/ipfs/",
    },
    blockscout: {
      url: "https://explorer.execution.l16.lukso.network/tx",
    },
  },
};

export const PRIVATE_KEY =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

export const DEFAULT_NETWORK_CONFIG = NETWORKS[DEFAULT_NETWORK];
