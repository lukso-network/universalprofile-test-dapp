import CustomRelayer from '../CustomRelayer.vue'
import { render, fireEvent, screen } from '@testing-library/vue'

const data = {
  name: 'my test relayer',
  apiUrl: 'https://relayer.l16.staging.lukso.dev/api/v3/',
  chainIds: [2828],
}

window.lukso = {
  request: jest.fn(),
} as any

jest.mock('@/compositions/useWeb3Onboard', () => ({
  __esModule: true,
  default: () => ({
    connectWallet: () => jest.fn(),
    disconnect: () => jest.fn(),
    setChainId: () => jest.fn(),
    setupWeb3Onboard: () => jest.fn(),
    getWeb3OnboardProvider: () => window.lukso,
  }),
}))

const windowSpy = jest.spyOn(window.lukso as any, 'request')

afterEach(() => {
  windowSpy.mockRestore()
})

test('can add relayer', async () => {
  render(CustomRelayer)

  await fireEvent.update(screen.getByTestId('relayer-name'), data.name)
  await fireEvent.update(screen.getByTestId('relayer-url'), data.apiUrl)
  await fireEvent.click(screen.getByTestId('add-relayer'))

  expect(screen.getByTestId('chain-id-list')).toHaveTextContent(/2828/)

  expect(windowSpy).toHaveBeenCalledWith({
    method: 'up_addTransactionRelayer',
    params: [data],
  })
})
