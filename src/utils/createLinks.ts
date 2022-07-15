import { DEFAULT_NETWORK_CONFIG } from "@/helpers/config";

export function createIpfsLink(url: string) {
  return url.replace("ipfs://", DEFAULT_NETWORK_CONFIG.ipfs.url);
}

export function createBlockScoutLink(hash: string) {
  return `${DEFAULT_NETWORK_CONFIG.blockscout.url}/${hash}/internal-transactions`;
}
