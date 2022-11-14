import Mint from '../Mint.vue'
import { render, fireEvent, screen } from '@testing-library/vue'

jest.mock('@/compositions/useWeb3', () => ({
  __esModule: true,
  default: () => ({
    contract: () => ({
      methods: {
        mint: () => ({
          send: () => ({
            on: () => ({
              once: () => jest.fn(),
            }),
          }),
        }),
      },
    }),
  }),
}))

test('can mint token', async () => {
  render(Mint)
  await fireEvent.update(
    screen.getByTestId('mint-address'),
    '0x7367C96553Ed4C44E6962A38d8a0b5f4BE9F6298'
  )
  await fireEvent.click(screen.getByTestId('mint'))

  expect(await screen.findByTestId('notification')).toHaveTextContent(
    'Token minted'
  )
})
