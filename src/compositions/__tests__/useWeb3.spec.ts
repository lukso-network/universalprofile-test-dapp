import useWeb3 from '@/compositions/useWeb3'

const mockIsAddress = jest.fn()

jest.mock('web3', () => {
  return jest.fn().mockImplementation(() => ({
    utils: {
      isAddress: (val: string) => mockIsAddress(val),
    },
  }))
})

test('can check for validity of address', () => {
  const { isAddress, setupWeb3 } = useWeb3()
  setupWeb3('lukso')
  isAddress('123')
  expect(mockIsAddress).toBeCalledWith('123')
})
