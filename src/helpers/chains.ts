import { Chain } from "wagmi/chains"
export const lukso: Chain = {
    id: 2828,
    network: "Lukso",
    name: "L16",
    nativeCurrency: {
        name: "Lukso",
        symbol: "LYXe",
        decimals: 18
    },
    rpcUrls: {
        default: {
            http: ["https://rpc.l16.lukso.network"]
        },
        public: {
            http: ["https://rpc.l16.lukso.network"]
        }
    },
    blockExplorers: {
        default: {
            name: "BlockScout",
            url: "https://explorer.execution.l16.lukso.network/"
        }
    }
};