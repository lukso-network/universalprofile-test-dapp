export function getAllItems(): { url: string; profile: string }[] {
  const values: { url: string; profile: string }[] = [];
  const keys = Object.keys(localStorage);
  let i = keys.length;

  while (i--) {
    if (keys[i].startsWith("ipfs://")) {
      values.push({
        url: keys[i].replace("ipfs://", "https://ipfs.lukso.network/ipfs/"),
        profile: JSON.parse(localStorage.getItem(keys[i]) as string),
      });
    }
  }

  return values;
}
