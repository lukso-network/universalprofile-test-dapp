import { DEFAULT_NETWORK_CONFIG } from "./../utils/networkConfig";

const IPFS_PREFIX = "ipfs://";

export function getAndPrepareAllIpfsItems(): {
  url: string;
  profile: string;
}[] {
  const values: { url: string; profile: string }[] = [];
  const keys = Object.keys(localStorage);
  let i = keys.length;

  while (i--) {
    if (keys[i].startsWith(IPFS_PREFIX)) {
      values.push({
        url: keys[i].replace(IPFS_PREFIX, DEFAULT_NETWORK_CONFIG.ipfs.url),
        profile: JSON.parse(localStorage.getItem(keys[i]) as string),
      });
    }
  }

  return values;
}
