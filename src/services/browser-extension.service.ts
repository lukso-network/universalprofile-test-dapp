import { BigNumberish } from "@ethersproject/bignumber";

export async function getAccounts(): Promise<Array<string>> {
  return await window.ethereum.request({
    method: "eth_accounts",
    params: [],
  });
}

export async function getBalance(address: string): Promise<BigNumberish> {
  return await window.ethereum.request({
    method: "eth_getBalance",
    params: [address, "latest"],
  });
}

export async function sendTransaction(
  from: string,
  to: string,
  value: string
): Promise<void> {
  await window.ethereum.request({
    method: "eth_sendTransaction",
    params: [
      {
        to,
        from,
        value,
      },
    ],
  });
}
