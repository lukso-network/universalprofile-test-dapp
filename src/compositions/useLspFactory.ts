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

export function useLspFactory(): {
  deployUniversalProfile: (
    profileDeploymentOptions: ProfileDeploymentOptions,
    contractDeploymentOptions?: ContractDeploymentOptions | undefined
  ) => Promise<DeployedUniversalProfileContracts>;
  getFactory: () => LSPFactory;
} {
  const hasExtension = !!window.ethereum;
  if (!hasExtension) {
    throw new Error("Extension not installed");
  }
  lspFactory = new LSPFactory(window.ethereum);
  return {
    deployUniversalProfile,
    getFactory,
  };
}
