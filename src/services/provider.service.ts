import { ethers, Signer } from 'ethers'
import { reactive } from 'vue'

let provider:
  | ethers.providers.JsonRpcProvider
  | ethers.providers.Web3Provider
  | null = null

export async function getSigner(): Promise<{
  signer: Signer
  provider: ethers.providers.JsonRpcProvider
  address: {
    address: string
  }
}> {
  if (!provider) {
    provider = new ethers.providers.JsonRpcProvider(
      import.meta.env.VUE_APP_JSON_RPC_PROVIDER
    )
    // provider = new ethers.providers.Web3Provider((window as any).ethereum);
  }

  // const signer = await provider.getSigner();
  const signer = new ethers.Wallet(
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    provider
  )

  const address = reactive({
    address: await signer.getAddress(),
  })

  if (window.ethereum) {
    window.ethereum.on('accountsChanged', (addresses: string[]) => {
      address.address = addresses[0]
    })
  }
  //@ts-ignore
  return { address, signer, provider }
}
