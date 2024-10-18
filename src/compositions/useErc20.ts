import { DeployedContract } from '@lukso/lsp-factory.js'

import erc20AndErc165 from '../abis/CustomERC20AndERC165/CustomERC20AndERC165.json'
import useWeb3Connection from './useWeb3Connection'

interface ERC20DeploymentOptions {
  from: string
  tokenName: string
  tokenSymbol: string
}

export interface DeployedERC20Token {
  ERC20Token: DeployedContract
}

const { getProvider, contract } = useWeb3Connection()

async function deployERC20Token({
  from,
  tokenName,
  tokenSymbol,
}: ERC20DeploymentOptions): Promise<DeployedERC20Token> {
  const erc20contract = contract(erc20AndErc165.abi as any, from)

  return new Promise((resolve, reject) => {
    erc20contract
      .deploy({
        data: erc20AndErc165.bytecode,
        arguments: [tokenName, tokenSymbol],
      })
      .send({ from })
      .on('receipt', (receipt: any) => {
        console.log('erc20 receipt', receipt)
        resolve({
          ERC20Token: {
            address: receipt.contractAddress,
            receipt,
          },
        })
      })
      .once('sending', (payload: any) => {
        console.log('erc20 sending', JSON.stringify(payload, null, 2))
      })
      .catch(reject)
  })
}

export function useERC20(): {
  deployERC20Token: (
    erc20DeploymentOptions: ERC20DeploymentOptions
  ) => Promise<DeployedERC20Token>
} {
  const hasExtension = !!getProvider()
  if (!hasExtension) {
    throw new Error('Extension not connected')
  }

  return {
    deployERC20Token,
  }
}
