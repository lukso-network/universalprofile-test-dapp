import { ProfileDataForEncoding } from '@lukso/lsp-factory.js/build/main/src/lib/interfaces/lsp3-profile'
import {
  DeployedUniversalProfileContracts,
  LSPFactory,
  ContractDeploymentOptions,
  ProfileDataBeforeUpload,
  ProfileDeploymentOptions,
} from '@lukso/lsp-factory.js'

import { UploadOptions } from '@lukso/lsp-factory.js/build/main/src/lib/interfaces/profile-upload-options'
import { DEFAULT_NETWORK_CONFIG } from '@/helpers/config'
import {
  DeployedLSP7DigitalAsset,
  DeployedLSP8IdentifiableDigitalAsset,
  DigitalAssetDeploymentOptions,
  LSP7DigitalAssetDeploymentOptions,
} from '@lukso/lsp-factory.js/build/main/src/lib/interfaces/digital-asset-deployment'

let lspFactory: LSPFactory

const getFactory = (): LSPFactory => {
  return lspFactory
}

const setupLSPFactory = (): void => {
  lspFactory = new LSPFactory(window.ethereum, {
    chainId: DEFAULT_NETWORK_CONFIG.chainId,
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
  digitalAssetDeploymentOptions: DigitalAssetDeploymentOptions
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

export function useLspFactory(): {
  deployUniversalProfile: (
    profileDeploymentOptions: ProfileDeploymentOptions,
    contractDeploymentOptions?: ContractDeploymentOptions | undefined
  ) => Promise<DeployedUniversalProfileContracts>
  uploadUniversalProfileMetaData: (
    profileData: ProfileDataBeforeUpload,
    uploadOptions?: UploadOptions
  ) => Promise<ProfileDataForEncoding>
  getFactory: () => LSPFactory
  deployLSP7DigitalAsset: (
    digitalAssetDeploymentOptions: LSP7DigitalAssetDeploymentOptions
  ) => Promise<DeployedLSP7DigitalAsset>
  deployLSP8IdentifiableDigitalAsset: (
    digitalAssetDeploymentOptions: DigitalAssetDeploymentOptions
  ) => Promise<DeployedLSP8IdentifiableDigitalAsset>
} {
  const hasExtension = !!window.ethereum
  if (!hasExtension) {
    throw new Error('Extension not installed')
  }
  setupLSPFactory()

  return {
    deployUniversalProfile,
    uploadUniversalProfileMetaData,
    getFactory,
    deployLSP7DigitalAsset,
    deployLSP8IdentifiableDigitalAsset,
  }
}
