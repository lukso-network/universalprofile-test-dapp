import { ProfileDataForEncoding } from '@lukso/lsp-factory.js/build/main/src/lib/interfaces/lsp3-profile'
import {
  DeployedUniversalProfileContracts,
  LSPFactory,
  ContractDeploymentOptions,
  ProfileDataBeforeUpload,
  ProfileDeploymentOptions,
} from '@lukso/lsp-factory.js'

import { UploadOptions } from '@lukso/lsp-factory.js/build/main/src/lib/interfaces/profile-upload-options'
import { getSelectedNetworkConfig } from '@/helpers/config'
import {
  DeployedLSP7DigitalAsset,
  DeployedLSP8IdentifiableDigitalAsset,
  LSP7DigitalAssetDeploymentOptions,
  LSP8IdentifiableDigitalAssetDeploymentOptions,
} from '@lukso/lsp-factory.js/build/main/src/lib/interfaces/digital-asset-deployment'
import useWeb3Connection from './useWeb3Connection'
import { BaseFormDataUploader } from '@/services/ipfs/formdata-base-client'
import { AuthenticatedFormDataUploader } from '../services/ipfs/authenticated-formdata-client'

let uploadProvider: BaseFormDataUploader | undefined

const { getProvider } = useWeb3Connection()

function getUploadProvider() {
  if (!uploadProvider) {
    uploadProvider = new AuthenticatedFormDataUploader(
      getSelectedNetworkConfig().ipfs.url,
      {}
    )
  }
  return uploadProvider
}

const getLSPFactory = async (): Promise<LSPFactory> => {
  const provider = getProvider()
  const uploadProvider = getUploadProvider()
  return new LSPFactory(provider as any, {
    chainId: getSelectedNetworkConfig().chainId,
    ipfsGateway: {
      // the http client adds /add and lsp-factory.js is currently still using it.
      // TODO: Change once lsp-factory.js is updated.
      url: uploadProvider.getEndpoint().replace('/add', ''),
      headers: {
        Authorization: `Bearer ${await uploadProvider.getToken()}`,
      },
    },
  })
}

const deployUniversalProfile = async (
  profileDeploymentOptions: ProfileDeploymentOptions,
  contractDeploymentOptions?: ContractDeploymentOptions | undefined
): Promise<DeployedUniversalProfileContracts> => {
  const lspFactory = await getLSPFactory()
  return await lspFactory.UniversalProfile.deploy(
    profileDeploymentOptions,
    contractDeploymentOptions
  )
}

const deployLSP7DigitalAsset = async (
  digitalAssetDeploymentOptions: LSP7DigitalAssetDeploymentOptions
): Promise<DeployedLSP7DigitalAsset> => {
  const lspFactory = await getLSPFactory()
  return await lspFactory.LSP7DigitalAsset.deploy(digitalAssetDeploymentOptions)
}

const deployLSP8IdentifiableDigitalAsset = async (
  digitalAssetDeploymentOptions: LSP8IdentifiableDigitalAssetDeploymentOptions
): Promise<DeployedLSP8IdentifiableDigitalAsset> => {
  const lspFactory = await getLSPFactory()
  return await lspFactory.LSP8IdentifiableDigitalAsset.deploy(
    digitalAssetDeploymentOptions
  )
}

const uploadUniversalProfileMetaData = async (
  profileData: ProfileDataBeforeUpload,
  uploadOptions?: UploadOptions
): Promise<ProfileDataForEncoding> => {
  const lspFactory = await getLSPFactory()
  return await lspFactory.UniversalProfile.uploadProfileData(
    profileData,
    uploadOptions
  )
}

export function useLspFactory() {
  const hasExtension = !!getProvider()
  if (!hasExtension) {
    throw new Error('Extension not installed')
  }
  return {
    deployUniversalProfile,
    uploadUniversalProfileMetaData,
    deployLSP7DigitalAsset,
    deployLSP8IdentifiableDigitalAsset,
  }
}
