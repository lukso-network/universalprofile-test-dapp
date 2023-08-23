import { getSelectedNetworkConfig } from '@/helpers/config'
import { MethodSelect } from '@/helpers/functionUtils'
import { LSPType } from '@/helpers/tokenUtils'

const { sampleUP } = getSelectedNetworkConfig()

export const methodSelectors: MethodSelect[] = [
  {
    label: '💰 Default',
  },
  {
    label: '💰 Transfer LSP7/LSP8',
    call: 'transfer',
    inputs: [
      { type: 'address', name: 'from' },
      { type: 'address', name: 'to' },
      { type: 'uint256', name: 'amount', value: '1', isWei: 'ether' },
      { type: 'bool', name: 'force', value: false },
      { type: 'bytes', name: 'data', value: '0x' },
    ],
    hasSpecs: [LSPType.LSP7DigitalAsset, LSPType.LSP8IdentifiableDigitalAsset],
  },
  {
    label: '💰 Authorize Operator LSP7',
    call: 'authorizeOperator',
    inputs: [
      { type: 'address', name: 'operator', value: sampleUP },
      { type: 'uint256', name: 'amount', value: '1' },
    ],
    hasSpecs: [LSPType.LSP7DigitalAsset],
  },
  {
    label: '💰 Revoke Operator LSP7',
    call: 'revokeOperator',
    inputs: [{ type: 'address', name: 'operator', value: sampleUP }],
    hasSpecs: [LSPType.LSP7DigitalAsset],
  },
  {
    label: '🏦 Mint LSP7',
    call: 'mint',
    inputs: [
      { type: 'address', name: 'to' },
      { type: 'uint256', name: 'amount', value: '1' },
      { type: 'bool', name: 'force', value: false },
      { type: 'bytes', name: 'data', value: '0x' },
    ],
    hasSpecs: [LSPType.LSP7DigitalAsset],
  },
  {
    label: '💰 Authorize Operator LSP8',
    call: 'authorizeOperator',
    inputs: [
      { type: 'address', name: 'operator', value: sampleUP },
      { type: 'bytes32', name: 'tokenId', value: '1' },
    ],
    hasSpecs: [LSPType.LSP8IdentifiableDigitalAsset],
  },
  {
    label: '💰 Revoke Operator LSP8',
    call: 'revokeOperator',
    inputs: [
      { type: 'address', name: 'operator', value: sampleUP },
      { type: 'bytes32', name: 'tokenId', value: '1' },
    ],
    hasSpecs: [LSPType.LSP8IdentifiableDigitalAsset],
  },

  {
    label: '🏦 Mint LSP8',
    call: 'mint',
    inputs: [
      { type: 'address', name: 'to' },
      { type: 'bytes32', name: 'tokenId', value: '1' },
      { type: 'bool', name: 'force', value: false },
      { type: 'bytes', name: 'data', value: '0x' },
    ],
    hasSpecs: [LSPType.LSP8IdentifiableDigitalAsset],
  },
  {
    label: '💰 Transfer Ownership UP',
    call: 'transferOwnership',
    inputs: [{ type: 'address', name: 'newOwner' }],
    hasSpecs: [LSPType.UP],
  },
  {
    label: '💰 Accept Ownership UP',
    call: 'acceptOwnership',
    inputs: [],
    hasSpecs: [LSPType.UP],
  },
  {
    label: '💰 Renounce Ownership UP',
    call: 'renounceOwnership',
    inputs: [],
    hasSpecs: [LSPType.UP],
  },
  {
    label: '💰 Transfer ERC20/ERC777',
    call: 'transfer',
    inputs: [
      { type: 'address', name: 'to', value: sampleUP },
      { type: 'uint256', name: 'amount', isWei: 'ether', value: '1' },
    ],
    hasSpecs: [LSPType.ERC20, LSPType.ERC777],
  },
  {
    label: '💰 Send ERC777',
    call: 'send',
    hasSpecs: [LSPType.ERC777],
    inputs: [
      { type: 'address', name: 'to' },
      { type: 'uint256', name: 'amount', isWei: 'ether', value: '1' },
      { type: 'bytes', name: 'data', value: '0x' },
    ],
  },
  {
    label: '💰Operator Send ERC777',
    call: 'operatorSend',
    hasSpecs: [LSPType.ERC777],
    inputs: [
      { type: 'address', name: 'sender' },
      { type: 'address', name: 'recipient' },
      { type: 'uint256', name: 'amount', isWei: 'ether', value: '1' },
      { type: 'bytes', name: 'data', value: '0x' },
      { type: 'bytes', name: 'operatorData', value: '0x' },
    ],
  },
  {
    label: '💰Operator Burn ERC777',
    call: 'operatorBurn',
    hasSpecs: [LSPType.ERC777],
    inputs: [
      { type: 'address', name: 'account' },
      { type: 'uint256', name: 'amount', isWei: 'ether', value: '1' },
      { type: 'bytes', name: 'data', value: '0x' },
      { type: 'bytes', name: 'operatorData', value: '0x' },
    ],
  },
  {
    label: '💰 TransferFrom ERC721',
    call: 'transferFrom',
    inputs: [
      { type: 'address', name: 'from' },
      { type: 'address', name: 'to' },
      { type: 'uint256', name: 'amount', isWei: 'ether', value: '1' },
    ],
    hasSpecs: [LSPType.ERC721],
  },
  {
    label: '💰 Approve ERC721 / ERC20',
    call: 'approve',
    inputs: [
      { type: 'address', name: 'approved' },
      { type: 'uint256', name: 'tokenId', value: '1' },
    ],
    hasSpecs: [LSPType.ERC721, LSPType.ERC20],
  },
  {
    label: '💰 SafeTransferFrom ERC1155',
    call: 'safeTransferFrom',
    inputs: [
      { type: 'address', name: 'from' },
      { type: 'address', name: 'to' },
      { type: 'uint256', name: 'id' },
      { type: 'uint256', name: 'amount', isWei: 'ether', value: '1' },
      { type: 'bytes', name: 'data', value: '0x' },
    ],
    hasSpecs: [LSPType.Unknown],
  },
  {
    label: '🏦 Mint ERC20/ERC777/LSP7',
    call: 'mint',
    hasSpecs: [LSPType.ERC777, LSPType.ERC20, LSPType.LSP7DigitalAsset],
    inputs: [
      { type: 'address', name: 'to' },
      { type: 'uint256', name: 'amount', isWei: 'ether', value: '100' },
    ],
  },
  {
    label: '🎛️ SetData',
    call: 'setData',
    hasSpecs: [
      LSPType.UP,
      LSPType.LSP3UniversalProfileMetadata,
      LSPType.LSP7DigitalAsset,
      LSPType.LSP8IdentifiableDigitalAsset,
      LSPType.LSP9Vault,
    ],
    inputs: [
      {
        type: 'bytes32[]',
        name: 'keys',
        isPairs: true,
        isKey: true,
      },
      { type: 'bytes[]', name: 'values', isPairs: true },
    ],
  },
  {
    label: '🦾 Sample call data',
    call: 'init',
    inputs: [
      {
        type: 'address[]',
        name: 'addresses',
        value: [
          '0x69909C12C875271AdC49155Cc8D01dBF67FE82f1',
          '0xB27F5845E6Ce846C02209Bd2497780099611b9a0',
        ],
      },
      {
        type: 'bytes32',
        name: 'data',
        value:
          '0x40b8bec57d7b5ff0dbd9e9acd0a47dfeb0101e1a203766f5ccab00445fbf39e9',
      },
      { type: 'uint256[]', name: 'numbers', value: ['2345675643', '123292'] },
      { type: 'bool', name: 'force', value: true },
      { type: 'string', name: 'scream', value: 'Hello!' },
      {
        type: 'string',
        name: 'description',
        value:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
      },
    ],
  },
]
