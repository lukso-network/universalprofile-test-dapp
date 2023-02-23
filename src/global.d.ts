export {}
declare global {
  interface Window {
    web3: Web3
    store?: Store
    erc725Account?: Contract
    keyManager?: Contract
    ERC725?: ERC725
    ethereum: any
  }
}

declare module '@lukso/lsp-smart-contracts/constants' {
  type ERC725YKeysType = {
    [key: string]: {
      [key: string]: string | { length: string; index: string }
    }
  }
  const ERC725YKeys: ERC725YKeysType

  type ErrorsType = {
    [T: string]: {
      [K: string]: { error: string; message: string }
    }
  }
  const Errors: ErrorsType

  type PermissionName =
    | 'CHANGEOWNER'
    | 'CHANGEPERMISSIONS'
    | 'ADDPERMISSIONS'
    | 'SETDATA'
    | 'CALL'
    | 'STATICCALL'
    | 'DELEGATECALL'
    | 'DEPLOY'
    | 'TRANSFERVALUE'
    | 'SIGN'
    | 'SUPER_SETDATA'
    | 'SUPER_TRANSFERVALUE'
    | 'SUPER_CALL'
    | 'SUPER_STATICCALL'
    | 'SUPER_DELEGATECALL'
  const PERMISSIONS: { [key in PermissionName]: string }

  const ALL_PERMISSIONS: string
  export {
    ERC725YKeys,
    PERMISSIONS,
    Errors,
    SupportedStandards,
    ALL_PERMISSIONS,
    PermissionName,
  }
}

interface ImportMeta {
  env: {
    VUE_APP_JSON_RPC_PROVIDER?: string
    BASE_URL?: string
    NODE_ENV?: 'development' | 'production'
    PORT?: string
    PWD: string
  }
}

declare module '@depay/web3-mock' {
  import type { Web3 } from 'web3'
  export function mock(name: string): Web3
}
