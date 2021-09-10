import versions from "./../../versions.json";

export function getDeployedBaseContracts(
  networkId: number
): NetworkContractVersions {
  const masterContractVersions = JSON.parse(JSON.stringify(versions));
  return masterContractVersions[networkId];
}

export interface NetworkContractVersions {
  [key: string]: NetworkInfo;
}
// prettier-ignore
export interface NetworkInfo {
  name:          string;
  chainId:       number;
  networkId:     number;
  baseContracts: BaseContracts;
}

// prettier-ignore
export interface BaseContracts {
  LSP3Account:                   Versions;
  UniversalReceiverAddressStore: Versions;
}

// prettier-ignore
export interface Versions {
  [key: string]: string;
}
