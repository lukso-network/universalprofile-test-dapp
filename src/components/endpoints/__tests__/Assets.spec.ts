import Assets from '../Assets.vue'
import { render, fireEvent, screen, waitFor } from '@testing-library/vue'
import { setState } from '@/stores'
import { useLspFactory } from '@/compositions/useLspFactory'
import { uploadAssetData } from '@/utils/uploadAssetData'
import {
  addTokenToLocalStore,
  encodeAssetMetadata,
  recalculateAssets,
} from '@/helpers/tokenUtils'

jest.mock('@/compositions/useLspFactory', () => ({
  useLspFactory: jest.fn(),
}))

jest.mock('@/utils/uploadAssetData', () => ({
  uploadAssetData: jest.fn(),
}))

jest.mock('@/helpers/tokenUtils', () => ({
  addTokenToLocalStore: jest.fn(),
  encodeAssetMetadata: jest.fn(),
  recalculateAssets: jest.fn(),
}))

jest.mock('@/compositions/useErc20', () => ({
  useERC20: () => ({
    deployERC20Token: () => jest.fn(),
  }),
}))

jest.mock('@/helpers/env', () => ({
  PUBLIC_API_SHARED_SECRET: '123',
}))

jest.mock('@/compositions/useWeb3Connection', () => ({
  __esModule: true,
  default: () => ({
    contract: () => ({
      methods: {
        owner: () => ({
          call: () => jest.fn(),
        }),
      },
    }),
  }),
}))

const mockUseLspFactory = useLspFactory as jest.Mock
const mockUploadAssetData = uploadAssetData as jest.Mock
const mockAddTokenToLocalStore = addTokenToLocalStore as jest.Mock
const mockEncodeAssetMetadata = encodeAssetMetadata as jest.Mock
const mockRecalculateAssets = recalculateAssets as jest.Mock
const mockDeployLSP7DigitalAsset = jest.fn()
const deployedAddress = '0x7367C96553Ed4C44E6962A38d8a0b5f4BE9F6298'

beforeEach(() => {
  jest.clearAllMocks()
  mockUseLspFactory.mockReturnValue({
    deployLSP7DigitalAsset: mockDeployLSP7DigitalAsset,
    deployLSP8IdentifiableDigitalAsset: jest.fn(),
  })
  mockUploadAssetData.mockResolvedValue({
    json: {
      LSP4Metadata: {
        description: 'My super description',
        links: [
          {
            title: 'LUKSO Docs',
            url: 'https://docs.lukso.tech',
          },
        ],
        images: [],
        assets: [],
        icon: [],
      },
    },
    url: 'ipfs://mock-token-metadata',
  })
  mockEncodeAssetMetadata.mockReturnValue('0xencodedmetadata')
  mockDeployLSP7DigitalAsset.mockResolvedValue({
    LSP7DigitalAsset: {
      address: deployedAddress,
    },
  })
})

test('can create token', async () => {
  setState('isConnected', true)
  render(Assets)

  await fireEvent.click(screen.getByTestId('create'))
  await waitFor(() => {
    expect(mockUploadAssetData).toHaveBeenCalledWith({
      description: 'My super description',
      links: [
        {
          title: 'LUKSO Docs',
          url: 'https://docs.lukso.tech',
        },
      ],
    })
    expect(mockDeployLSP7DigitalAsset).toHaveBeenCalledWith(
      expect.objectContaining({
        digitalAssetMetadata: '0xencodedmetadata',
      })
    )
    expect(mockAddTokenToLocalStore).toHaveBeenCalledWith(deployedAddress)
    expect(mockRecalculateAssets).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('notification')).toHaveTextContent(
      'Token created'
    )
    expect(screen.getByTestId('token-address')).toHaveTextContent(
      deployedAddress
    )
  })
})
