import ImportProfile from '../ImportProfile.vue'
import { render, fireEvent, screen } from '@testing-library/vue'

window.ethereum = {
  request: jest.fn(),
}
const mockIsAddress = jest.fn()

const windowSpy = jest.spyOn(window.ethereum, 'request')

jest.mock('@/compositions/useWeb3', () => ({
  __esModule: true,
  default: () => ({
    isAddress: () => mockIsAddress(),
  }),
}))

beforeEach(() => {
  mockIsAddress.mockReturnValue(false)
})
afterEach(() => {
  windowSpy.mockRestore()
})

test('cannot import profile', async () => {
  render(ImportProfile)

  await fireEvent.update(screen.getByTestId('controller-address'), '')
  await fireEvent.click(screen.getByTestId('import-profile'))
  expect(
    screen.getByText(/please provide a controller address/i)
  ).toBeInTheDocument()
})

test('cannot import profile with an invalid address', async () => {
  render(ImportProfile)

  await fireEvent.update(screen.getByTestId('controller-address'), '0x812912')
  mockIsAddress.mockReturnValue(false)
  await fireEvent.click(screen.getByTestId('import-profile'))
  expect(
    screen.getByText(/please provide a valid controller address/i)
  ).toBeInTheDocument()
})

test('can import profile with a valid address', async () => {
  render(ImportProfile)

  await fireEvent.update(
    screen.getByTestId('controller-address'),
    '0x96dd88b135Cc1503c014D58c6BeF7581102160E7'
  )
  mockIsAddress.mockReturnValue(true)
  await fireEvent.click(screen.getByTestId('import-profile'))
  expect(
    screen.getByText(/profile imported successfully./i)
  ).toBeInTheDocument()
})
