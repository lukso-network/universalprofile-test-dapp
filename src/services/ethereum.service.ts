import Web3 from "web3";

const web3 = new Web3(window.ethereum);
const { ethereum } = window;

export async function getAccount(): Promise<Array<string>> {
  const accountsRequest = await ethereum.request({
    method: "eth_requestAccounts",
    params: [],
  });
  console.log(accountsRequest.accounts);
  return accountsRequest?.accounts[0];
}

export async function getBalance(address: string): Promise<string> {
  const wei = await web3.eth.getBalance(address);
  return web3.utils.fromWei(wei, "ether");
}

export async function sendTransaction(from: string, to: string, value: string) {
  return await web3.eth.sendTransaction({
    from,
    to,
    value,
  });
}

// export async function sendTransaction(
//   from: string,
//   to: string,
//   value: string
// ): Promise<void> {
//   return await ethereum.request({
//     method: "eth_sendTransaction",
//     params: [
//       {
//         to,
//         from,
//         value,
//       },
//     ],
//   });
// }
