export enum ContractStandard {
  LSP7 = 'LSP7',
  LSP8 = 'LSP8',
  ERC20 = 'ERC20',
  ERC777 = 'ERC777',
  ERC721 = 'ERC721',
}

export const LSP8TokenIdTypes = [
  'NUMBER',
  'STRING',
  'UNIQUE_ID',
  'HASH',
  'ADDRESS',
]

export const LSP8TokenIdTypesData = [
  'uint256',
  'string',
  'bytes32',
  'bytes32',
  'address',
]
