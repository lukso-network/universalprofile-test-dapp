import versions from "./../../versions.json";

export function getDeployedBaseContracts(networkId: number): NetworkInfo {
  const masterContractVersions = JSON.parse(JSON.stringify(versions));
  return masterContractVersions[networkId];
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
