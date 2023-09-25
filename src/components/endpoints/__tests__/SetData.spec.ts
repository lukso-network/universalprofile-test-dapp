import SetData from '../SetData.vue'
import { render, fireEvent, screen } from '@testing-library/vue'
import { setState } from '@/stores'
import { Contract } from 'web3-eth-contract'

const mockSend = jest.fn()

jest.mock('@/compositions/useWeb3Connection', () => ({
  __esModule: true,
  default: () => ({
    contract: () => ({
      methods: {
        owner: () => ({
          call: () => jest.fn(),
        }),
      },
    }),
  }),
}))

window.erc725Account = {
  methods: {
    setDataBatch: (key: any[], value: any[]) => ({
      send: () => mockSend(key, value),
    }),
  },
} as Contract

beforeEach(() => {
  jest.resetAllMocks()
})

test('can set data', async () => {
  setState('address', '0x517216362D594516c6f96Ee34b2c502d65B847E4')

  mockSend.mockImplementation(() => ({
    on: () => ({
      once: () => jest.fn(),
    }),
  }))

  render(SetData)

  await fireEvent.click(screen.getByTestId('setData'))

  expect(screen.getByTestId('notification')).toHaveTextContent('Set data')
  expect(mockSend).toBeCalledWith(
    ['0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5'],
    [
      '0x6f357c6a32f2cf55bde7f2cdf315fe1f2246832b5de988df953c99e4b0c659e3b8525d95697066733a2f2f516d57787a6d37545264466b76767075744239714b336a5975324644436655594a6e344d74374463636f747a3659',
    ]
  )
})

test('can see set data error from send function', async () => {
  setState('address', '0x517216362D594516c6f96Ee34b2c502d65B847E4')
  mockSend.mockImplementation(() => {
    throw new Error('Send error')
  })

  render(SetData)

  await fireEvent.click(screen.getByTestId('setData'))

  expect(screen.getByTestId('notification')).toHaveTextContent('Send error')
})
