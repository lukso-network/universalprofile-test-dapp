import Assets from '../Assets.vue'
import { render, fireEvent, screen } from '@testing-library/vue'
import { setState } from '@/stores'

jest.mock('@/compositions/useWeb3', () => ({
  __esModule: true,
  default: () => ({
    contract: () => ({
      deploy: () => ({
        send: () => ({
          on: () => ({
            once: () => ({
              options: {
                address: '0x7367C96553Ed4C44E6962A38d8a0b5f4BE9F6298',
              },
              methods: {
                mint: () => ({
                  send: () => ({
                    on: () => ({
                      once: () => jest.fn(),
                    }),
                  }),
                }),
                transfer: () => ({
                  encodeABI: () => jest.fn(),
                }),
              },
            }),
          }),
        }),
      }),
    }),
  }),
}))

test('can create token', async () => {
  setState('isConnected', true)
  render(Assets)

  await fireEvent.click(screen.getByTestId('create'))
  expect(screen.getByTestId('notification')).toHaveTextContent('Token created')
  expect(screen.getByTestId('token-address')).toHaveTextContent(
    '0x7367C96553Ed4C44E6962A38d8a0b5f4BE9F6298'
  )
})

test('can mint token', async () => {
  render(Assets)

  await fireEvent.click(screen.getByTestId('create'))
  await fireEvent.update(
    screen.getByTestId('mint-address'),
    '0x7367C96553Ed4C44E6962A38d8a0b5f4BE9F6298'
  )
  await fireEvent.click(screen.getByTestId('mint'))

  expect(await screen.findByTestId('notification')).toHaveTextContent(
    'Token minted'
  )
})
