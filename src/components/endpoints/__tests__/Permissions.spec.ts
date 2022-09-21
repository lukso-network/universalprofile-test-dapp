import Permissions from '../Permissions.vue'
import { render, fireEvent, screen } from '@testing-library/vue'
import { setState } from '@/stores'
import { Contract } from 'web3-eth-contract'

const mockSend = jest.fn()

window.erc725Account = {
  methods: {
    'setData(bytes32[],bytes[])': (key: any[], value: any[]) => ({
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
    ['0x4b80742de2bf82acb3630000af3bf2ffb025098b79caddfbdd113b3681817744'],
    ['0x0000000000000000000000000000000000000000000000000000000000000001']
  )
})

test('can see error for set permissions when no given address', async () => {
  setState('address', undefined)

  render(Permissions)

  await fireEvent.click(screen.getByTestId('setPermissions'))

  expect(screen.getByTestId('notification')).toHaveTextContent(
    'No valid address'
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
