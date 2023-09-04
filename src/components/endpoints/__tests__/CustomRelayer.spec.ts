import CustomRelayer from '../CustomRelayer.vue'
import { render, fireEvent, screen } from '@testing-library/vue'

const data = {
  name: 'my test relayer',
  apiUrl: 'https://relayer.l16.staging.lukso.dev/api/v3/',
  chainIds: [2828],
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

  expect(screen.getByTestId('chain-id-list')).toHaveTextContent(/2828/)

  expect(mockSendRequest).toHaveBeenCalledWith({
    method: 'up_addTransactionRelayer',
    params: [data],
  })
})
