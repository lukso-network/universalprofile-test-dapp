import Web3 from "web3";
import { provider as Provider } from "web3-core";
import { AbiItem } from "web3-utils";
import { Contract, ContractOptions } from "web3-eth-contract";

let web3: Web3;

const setupWeb3 = (provider: Provider): void => {
  web3 = new Web3(provider);
  window.web3 = web3;
};

const getWeb3 = (): Web3 => {
  return web3;
};

const getChainId = async (): Promise<number> => {
  return await web3.eth.getChainId();
};

const contract = (
  jsonInterface: AbiItem,
  address?: string,
  options?: ContractOptions
) => {
  return new web3.eth.Contract(jsonInterface, address, options);
};

export default function useWeb3(): {
  setupWeb3: (provider: Provider) => void;
  getWeb3: () => Web3;
  getChainId: () => Promise<number>;
  contract: (
    jsonInterface: AbiItem,
    address?: string,
    options?: ContractOptions
  ) => Contract;
} {
  return {
    setupWeb3,
    getWeb3,
    getChainId,
    contract,
  };
}
