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
  DigitalAssetDeploymentOptions,
  LSP7DigitalAssetDeploymentOptions,
} from '@lukso/lsp-factory.js/build/main/src/lib/interfaces/digital-asset-deployment'
import useWeb3Onboard from './useWeb3Onboard'

let lspFactory: LSPFactory

const { getWeb3OnboardProvider } = useWeb3Onboard()

const setupLSPFactory = (): void => {
  const provider = getWeb3OnboardProvider()
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
  deployLSP7DigitalAsset: (
    digitalAssetDeploymentOptions: LSP7DigitalAssetDeploymentOptions
  ) => Promise<DeployedLSP7DigitalAsset>
  deployLSP8IdentifiableDigitalAsset: (
    digitalAssetDeploymentOptions: DigitalAssetDeploymentOptions
  ) => Promise<DeployedLSP8IdentifiableDigitalAsset>
} {
  const hasExtension = !!getWeb3OnboardProvider()
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
