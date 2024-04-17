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

let lspFactory: LSPFactory

const { getProvider } = useWeb3Connection()

const setupLSPFactory = (): void => {
  const provider = getProvider()
  lspFactory = new LSPFactory(provider as any, {
    chainId: getSelectedNetworkConfig().chainId,
  })
}

const deployUniversalProfile = async (
  profileDeploymentOptions: ProfileDeploymentOptions,
  contractDeploymentOptions?: ContractDeploymentOptions | undefined
): Promise<DeployedUniversalProfileContracts> => {
  return await lspFactory.UniversalProfile.deploy(
    profileDeploymentOptions,
    contractDeploymentOptions
  )
}

const deployLSP7DigitalAsset = async (
  digitalAssetDeploymentOptions: LSP7DigitalAssetDeploymentOptions
): Promise<DeployedLSP7DigitalAsset> => {
  return await lspFactory.LSP7DigitalAsset.deploy(digitalAssetDeploymentOptions)
}

const deployLSP8IdentifiableDigitalAsset = async (
  digitalAssetDeploymentOptions: LSP8IdentifiableDigitalAssetDeploymentOptions
): Promise<DeployedLSP8IdentifiableDigitalAsset> => {
  return await lspFactory.LSP8IdentifiableDigitalAsset.deploy(
    digitalAssetDeploymentOptions
  )
}

const uploadUniversalProfileMetaData = async (
  profileData: ProfileDataBeforeUpload,
  uploadOptions?: UploadOptions
): Promise<ProfileDataForEncoding> => {
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
  setupLSPFactory()

  return {
    deployUniversalProfile,
    uploadUniversalProfileMetaData,
    deployLSP7DigitalAsset,
    deployLSP8IdentifiableDigitalAsset,
  }
}
