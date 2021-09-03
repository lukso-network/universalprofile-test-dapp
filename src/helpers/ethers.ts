import { ethers } from "ethers";
import { formatEther } from "ethers/lib/utils";

export function shortAddress(address: string, length = 10): string {
  return address.substr(0, length);
}

export async function getBalanceFormatted(
  provider: ethers.providers.Provider,
  address: string
): Promise<string> {
  const balance = await provider.getBalance(address);
  const remainder = balance.mod(1e14);
  return formatEther(balance.sub(remainder));
}

export function formatNumber(number: number): string {
  return new Intl.NumberFormat("de-CH").format(number);
}
