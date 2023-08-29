import { useLspFactory } from '@/compositions/useLspFactory'
import { LSPFactory } from '@lukso/lsp-factory.js'

jest.mock('@lukso/lsp-factory.js', () => ({
  LSPFactory: jest.fn(),
}))

describe('can produce LSP Factory', () => {
  beforeAll(async () => {
    window.lukso = {} as any
    useLspFactory()
  })

  it('should be called with window.lukso', async () => {
    expect(LSPFactory).toBeCalledWith({}, { chainId: 4201 })
  })

  it('should return null for empty chain id', async () => {
    window.lukso = undefined
    expect(useLspFactory).toThrow('Extension not installed')
  })
})
