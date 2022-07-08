import { NetworkInfo, NetworkType } from "@/interfaces/network";

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
  l14: {
    name: "l14",
    rpc: {
      url: "https://rpc.l14.lukso.network",
    },
    cache: {
      url: "https://erc725cache.l14.lukso.network/graphql",
    },
    ipfs: {
      url: "https://2eff.lukso.dev/ipfs/",
    },
    blockscout: {
      url: "https://explorer.execution.l14.lukso.network/tx",
    },
  },
};

export const PRIVATE_KEY =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

export const DEFAULT_NETWORK_CONFIG = NETWORKS[DEFAULT_NETWORK];
