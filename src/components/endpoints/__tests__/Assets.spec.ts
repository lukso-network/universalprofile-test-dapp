import Assets from '../Assets.vue'
import { render, fireEvent, screen, waitFor } from '@testing-library/vue'
import { setState } from '@/stores'

const mockDeployLSP7DigitalAsset = jest.fn()
jest.mock('@/compositions/useLspFactory', () => ({
  useLspFactory: () => ({
    deployLSP7DigitalAsset: () => mockDeployLSP7DigitalAsset(),
  }),
}))

test('can create token', async () => {
  setState('isConnected', true)
  mockDeployLSP7DigitalAsset.mockReturnValue({
    LSP7DigitalAsset: {
      address: '0x7367C96553Ed4C44E6962A38d8a0b5f4BE9F6298',
    },
  })
  render(Assets)

  await fireEvent.click(screen.getByTestId('create'))
  await waitFor(() => {
    expect(screen.getByTestId('notification')).toHaveTextContent(
      'Token created'
    )
    expect(screen.getByTestId('token-address')).toHaveTextContent(
      '0x7367C96553Ed4C44E6962A38d8a0b5f4BE9F6298'
    )
  })
})
