import ContractFunction from '../ContractFunction.vue'
import { render, screen, waitFor } from '@testing-library/vue'
import { setState } from '@/stores'

const mockGetBalance = jest.fn()
const mockSendTransaction = jest.fn()
const mockEncodeFunctionSignature = jest.fn()
const mockEncodeParameters = jest.fn()

jest.mock('@/compositions/useWeb3Onboard', () => ({
  __esModule: true,
  default: () => ({}),
}))
jest.mock('@/compositions/useWeb3Connection', () => {
  const output = {
    __esModule: true,
    default: () => {
      return {
        getWeb3: () => ({
          eth: {
            abi: {
              encodeFunctionSignature: () => mockEncodeFunctionSignature(),
              encodeParameters: () => mockEncodeParameters(),
              decodeData: () => {
                return {
                  call: 'minter',
                  inputs: [],
                }
              },
            },
          },
        }),
        getBalance: () => mockGetBalance(),
        sendTransaction: (params: any) => mockSendTransaction(params),
      }
    },
  }
  return output
})

test('can send transaction from preset', async () => {
  setState('address', '0x517216362D594516c6f96Ee34b2c502d65B847E4')
  mockSendTransaction.mockClear()
  mockEncodeFunctionSignature.mockReturnValue('0x40c10f19')
  mockEncodeParameters.mockReturnValueOnce(
    '000000000000000000000000517216362d594516c6f96ee34b2c502d65b847e40000000000000000000000000000000000000000000000056bc75e2d63100000'
  )
  const utils = render(ContractFunction, {
    props: {
      call: 'mint',
      hideData: true,
      custom: true,
      modelValue: [
        {
          type: 'address',
          name: 'to',
          value: '0x40cC70CBd053841D7a37bC11415450D8881600bc',
          error: false,
        },
        {
          type: 'uint256',
          name: 'amount',
          isWei: 'ether',
          value: '100',
          error: false,
        },
      ],
      onlyParams: false,
    },
  })

  await waitFor(() => {
    expect(screen.getByTestId('function-call')).toHaveValue(
      'mint(address to, uint256 amount)'
    )
  })

  expect(utils.emitted()['update:data']).toEqual([
    [
      '0x40c10f190000000000000000000000517216362d594516c6f96ee34b2c502d65b847e40000000000000000000000000000000000000000000000056bc75e2d63100000',
    ],
  ])
})
