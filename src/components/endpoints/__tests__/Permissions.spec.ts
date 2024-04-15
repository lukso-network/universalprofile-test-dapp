import Permissions from '../Permissions.vue'
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

test('can update permissions for given address', async () => {
  setState('address', '0x517216362D594516c6f96Ee34b2c502d65B847E4')

  mockSend.mockImplementation(() => ({
    on: () => ({
      once: () => jest.fn(),
    }),
  }))

  render(Permissions)

  await fireEvent.click(screen.getByTestId('CHANGEOWNER'))
  await fireEvent.click(screen.getByTestId('setPermissions'))

  expect(screen.getByTestId('notification')).toHaveTextContent(
    'Permissions set'
  )
  expect(mockSend).toBeCalledWith(
    [
      '0x4b80742de2bf82acb3630000af3bf2ffb025098b79caddfbdd113b3681817744',
      '0xdf30dba06db6a30e65354d9a64c609861f089545ca58c6b4dbe31a5f338cb0e3',
      '0xdf30dba06db6a30e65354d9a64c6098600000000000000000000000000000007',
    ],
    [
      '0x0000000000000000000000000000000000000000000000000000000000000001',
      '0x00000000000000000000000000000008',
      '0xaf3bf2ffb025098b79caddfbdd113b3681817744',
    ]
  )
})

test('can see set permission error from send function', async () => {
  setState('address', '0x517216362D594516c6f96Ee34b2c502d65B847E4')

  mockSend.mockImplementation(() =>
    jest.fn().mockImplementation(() => {
      throw new Error('Send error')
    })()
  )

  render(Permissions)

  await fireEvent.click(screen.getByTestId('setPermissions'))

  expect(screen.getByTestId('notification')).toHaveTextContent('Send error')
})
