import { DEFAULT_IPFS_URL } from "./config";

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
        url: keys[i].replace(IPFS_PREFIX, DEFAULT_IPFS_URL),
        profile: JSON.parse(localStorage.getItem(keys[i]) as string),
      });
    }
  }

  return values;
}
