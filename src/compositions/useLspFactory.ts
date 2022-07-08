import { ProfileDataForEncoding } from "@lukso/lsp-factory.js/build/main/src/lib/interfaces/lsp3-profile";
import {
  DeployedUniversalProfileContracts,
  LSPFactory,
} from "@lukso/lsp-factory.js";
import {
  ContractDeploymentOptions,
  ProfileDataBeforeUpload,
  ProfileDeploymentOptions,
} from "@lukso/lsp-factory.js-alpha";
import {
  DeployedLSP7DigitalAsset,
  DeployedLSP8IdentifiableDigitalAsset,
  DigitalAssetDeploymentOptions,
  LSP7ContractDeploymentOptions,
  LSP7DigitalAssetDeploymentOptions,
  LSP8ContractDeploymentOptions,
} from "@lukso/lsp-factory.js/build/main/src/lib/interfaces/digital-asset-deployment";
import { UploadOptions } from "@lukso/lsp-factory.js/build/main/src/lib/interfaces/profile-upload-options";

let lspFactory: LSPFactory;

const getFactory = (): LSPFactory => {
  return lspFactory;
};

const deployUniversalProfile = async (
  profileDeploymentOptions: ProfileDeploymentOptions,
  contractDeploymentOptions?: ContractDeploymentOptions | undefined
): Promise<DeployedUniversalProfileContracts> => {
  return await lspFactory.UniversalProfile.deploy(
    profileDeploymentOptions,
    contractDeploymentOptions
  );
};

const uploadUniversalProfileMetaData = async (
  profileData: ProfileDataBeforeUpload,
  uploadOptions?: UploadOptions
): Promise<ProfileDataForEncoding> => {
  return await lspFactory.UniversalProfile.uploadProfileData(
    profileData,
    uploadOptions
  );
};

const deployLsp7DigitalAsset = async (
  digitalAssetDeploymentOptions: LSP7DigitalAssetDeploymentOptions,
  contractDeploymentOptions?: LSP7ContractDeploymentOptions
): Promise<DeployedLSP7DigitalAsset> => {
  return await lspFactory.LSP7DigitalAsset.deploy(
    digitalAssetDeploymentOptions,
    contractDeploymentOptions
  );
};

const deployLSP8IdentifiableDigitalAsset = async (
  digitalAssetDeploymentOptions: DigitalAssetDeploymentOptions,
  contractDeploymentOptions?: LSP8ContractDeploymentOptions
): Promise<DeployedLSP8IdentifiableDigitalAsset> => {
  return await lspFactory.LSP8IdentifiableDigitalAsset.deploy(
    digitalAssetDeploymentOptions,
    contractDeploymentOptions
  );
};

export function useLspFactory(): {
  deployLSP8IdentifiableDigitalAsset: (
    digitalAssetDeploymentOptions: DigitalAssetDeploymentOptions,
    contractDeploymentOptions?: LSP8ContractDeploymentOptions
  ) => Promise<DeployedLSP8IdentifiableDigitalAsset>;
  deployLsp7DigitalAsset: (
    digitalAssetDeploymentOptions: LSP7DigitalAssetDeploymentOptions,
    contractDeploymentOptions?: LSP7ContractDeploymentOptions
  ) => Promise<DeployedLSP7DigitalAsset>;
  uploadUniversalProfileMetaData: (
    profileData: ProfileDataBeforeUpload,
    uploadOptions?: UploadOptions
  ) => Promise<ProfileDataForEncoding>;
  deployUniversalProfile: (
    profileDeploymentOptions: ProfileDeploymentOptions,
    contractDeploymentOptions?: ContractDeploymentOptions | undefined
  ) => Promise<DeployedUniversalProfileContracts>;
  getFactory: () => LSPFactory;
} | null {
  const hasExtension = !!window.ethereum;
  console.log(window.ethereum);
  if (hasExtension) {
    lspFactory = new LSPFactory(window.ethereum);
    return {
      deployLSP8IdentifiableDigitalAsset,
      deployLsp7DigitalAsset,
      uploadUniversalProfileMetaData,
      deployUniversalProfile,
      getFactory,
    };
  }
  return null;
}
