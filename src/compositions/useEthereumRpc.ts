import useWeb3 from "@/compositions/useWeb3";
import { TransactionConfig, TransactionReceipt } from "web3-core";

const { getWeb3 } = useWeb3();
const { ethereum } = window;

const accounts = async () => {
  const [account] = await getWeb3().eth.getAccounts();
  return account;
};

const getBalance = async (address: string) => {
  const wei = await getWeb3().eth.getBalance(address);
  return getWeb3().utils.fromWei(wei);
};

const requestAccounts = async (): Promise<string[]> => {
  const accountsRequest: string[] = await ethereum.request({
    method: "eth_requestAccounts",
    params: [],
  });
  return accountsRequest;
};

const sendTransaction = async (transaction: TransactionConfig) => {
  return await getWeb3().eth.sendTransaction(transaction);
};

export default function useEthereumRpc(): {
  accounts: () => Promise<string>;
  getBalance: (address: string) => Promise<string>;
  requestAccounts: () => Promise<string[]>;
  sendTransaction: (
    transaction: TransactionConfig
  ) => Promise<TransactionReceipt>;
} {
  return {
    accounts,
    getBalance,
    requestAccounts,
    sendTransaction,
  };
}
