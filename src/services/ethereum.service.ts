import Web3 from "web3";

const web3 = new Web3(window.ethereum);
const { ethereum } = window;
const WEI_UNIT = "ether";

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
  return web3.utils.fromWei(wei, WEI_UNIT);
}

export async function sendTransaction(from: string, to: string, value: string) {
  const weiValue = web3.utils.toWei(value, WEI_UNIT);
  return await web3.eth.sendTransaction({
    from,
    to,
    value: weiValue,
  });
}

// export async function sendTransaction(
//   from: string,
//   to: string,
//   value: string
// ): Promise<void> {
//   const weiValue = web3.utils.toWei(value, WEI_UNIT);
//   return await ethereum.request({
//     method: "eth_sendTransaction",
//     params: [
//       {
//         to,
//         from,
//         value: weiValue,
//       },
//     ],
//   });
// }
