import CustomRelayer from '../CustomRelayer.vue'
import { render, fireEvent, screen } from '@testing-library/vue'

const data = {
  name: 'my test relayer',
  apiUrl: 'https://relayer.testnet.lukso.network/v1/relayer',
  chainIds: [4201],
}

const mockSendRequest = jest.fn()

jest.mock('@/compositions/useWeb3Connection', () => ({
  __esModule: true,
  default: () => ({
    sendRequest: (arg: any) => mockSendRequest(arg),
  }),
}))

test('can add relayer', async () => {
  render(CustomRelayer)

  await fireEvent.update(screen.getByTestId('relayer-name'), data.name)
  await fireEvent.update(screen.getByTestId('relayer-url'), data.apiUrl)
  await fireEvent.click(screen.getByTestId('add-relayer'))

  expect(screen.getByTestId('chain-id-list')).toHaveTextContent(/4201/)

  expect(mockSendRequest).toHaveBeenCalledWith({
    method: 'up_addTransactionRelayer',
    params: [data],
  })
})
