import { DEFAULT_NETWORK_CONFIG } from "@/helpers/config";

export function createBlockScoutLink(hash: string) {
  return `${DEFAULT_NETWORK_CONFIG.blockscout.url}/${hash}/internal-transactions`;
}
