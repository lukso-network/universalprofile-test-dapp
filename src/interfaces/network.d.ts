export type NetworkType =
  | 'lukso_testnet'
  | 'lukso_mainnet'
  | 'base_mainnet'
  | 'base_sepolia'

export type NetworkInfo = {
  id: string
  name: string
  http: { url: string }
  ws: { url: string }
  cache?: { url: string }
  ipfs: { url: string }
  relayer?: { url: string }
  explorer?: { url: string }
  chainId: number
  sampleEoA: string
  sampleUP: string
  errorContract: string
  sampleSC: string
  // ERC20
  erc20TokenWithEip165: string
  erc20TokenWithoutEip165: string
  // ERC777
  erc777TokenWithEip165: string
  erc777TokenWithoutEip165: string
  // LSP7
  lsp7TokenDivisible: string
  lsp7TokenNonDivisible: string
  // ERC721
  erc721TokenWithEip165: string
}
