import Web3 from "web3";
import { TransactionReceipt } from "web3-core";
import Web3Utils from "web3-utils";

const { ethereum } = window;
const web3 = new Web3(ethereum);
const WEI_UNIT = "ether";

export async function accounts(): Promise<string> {
  const [account] = await web3.eth.getAccounts();
  return account;
}

export async function requestAccounts(): Promise<string> {
  const accountsRequest = await ethereum.request({
    method: "eth_requestAccounts",
    params: [],
  });
  return accountsRequest?.accounts[0];
}

export async function getBalance(address: string): Promise<string> {
  const wei = await web3.eth.getBalance(address);
  return Web3Utils.fromWei(wei, WEI_UNIT);
}

export async function sendTransaction(
  from: string,
  to: string,
  value: string
): Promise<TransactionReceipt> {
  const weiValue = web3.utils.toWei(value, WEI_UNIT);
  return await web3.eth.sendTransaction({
    from,
    to,
    value: weiValue,
  });
}
