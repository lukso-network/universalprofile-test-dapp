import Web3 from "web3";
import { provider as Provider } from "web3-core";

let web3: Web3;

const setupWeb3 = (provider: Provider): void => {
  web3 = new Web3(provider);
  window.web3 = web3;
};

const getWeb3 = (): Web3 => {
  return web3;
};

export default function useWeb3(): {
  setupWeb3: (provider: Provider) => void;
  getWeb3: () => Web3;
} {
  return {
    setupWeb3,
    getWeb3,
  };
}
