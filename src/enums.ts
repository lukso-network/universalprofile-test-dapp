export enum ContractStandard {
  LSP7 = 'LSP7',
  LSP8 = 'LSP8',
  ERC20 = 'ERC20',
  ERC777 = 'ERC777',
  ERC721 = 'ERC721',
}

export const LSP8TokenIdFormats = [
  'NUMBER',
  'STRING',
  'UNIQUE_ID',
  'HASH',
  'ADDRESS',
]

export const LSP8TokenIdFormatsData = [
  'uint256',
  'string',
  'bytes',
  'bytes32',
  'address',
]
