import { ProfileDataForEncoding } from "@lukso/lsp-factory.js/build/main/src/lib/interfaces/lsp3-profile";
import {
  DeployedUniversalProfileContracts,
  LSPFactory,
  ContractDeploymentOptions,
  ProfileDataBeforeUpload,
  ProfileDeploymentOptions,
} from "@lukso/lsp-factory.js";

import { UploadOptions } from "@lukso/lsp-factory.js/build/main/src/lib/interfaces/profile-upload-options";
import { DEFAULT_NETWORK_CONFIG } from "@/helpers/config";

let lspFactory: LSPFactory;

const getFactory = (): LSPFactory => {
  return lspFactory;
};

const setupLSPFactory = (): void => {
  lspFactory = new LSPFactory(window.ethereum, {
    chainId: DEFAULT_NETWORK_CONFIG.chainId,
  });
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

export function useLspFactory(): {
  deployUniversalProfile: (
    profileDeploymentOptions: ProfileDeploymentOptions,
    contractDeploymentOptions?: ContractDeploymentOptions | undefined
  ) => Promise<DeployedUniversalProfileContracts>;
  uploadUniversalProfileMetaData: (
    profileData: ProfileDataBeforeUpload,
    uploadOptions?: UploadOptions
  ) => Promise<ProfileDataForEncoding>;
  getFactory: () => LSPFactory;
} {
  const hasExtension = !!window.ethereum;
  if (!hasExtension) {
    throw new Error("Extension not installed");
  }
  setupLSPFactory();

  return {
    deployUniversalProfile,
    uploadUniversalProfileMetaData,
    getFactory,
  };
}
