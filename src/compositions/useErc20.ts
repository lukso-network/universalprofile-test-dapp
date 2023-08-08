import { DeployedContract } from '@lukso/lsp-factory.js'
import erc20 from '@openzeppelin/contracts/build/contracts/ERC20.json'
import erc165 from '@openzeppelin/contracts/build/contracts/ERC165.json'

import useWeb3 from './useWeb3'
import { DEFAULT_GAS, DEFAULT_GAS_PRICE } from '@/helpers/config'

interface ERC20DeploymentOptions {
  from: string
  tokenName: string
  tokenSymbol: string
}

interface DeployedERC20Token {
  ERC20Token: DeployedContract
}

async function deployERC20Token({
  from,
  tokenName,
  tokenSymbol,
}: ERC20DeploymentOptions): Promise<DeployedERC20Token> {
  const { contract } = useWeb3()
  const erc20contract = contract(
    erc165.abi.concat(erc20.abi as any) as any,
    from,
    {
      gas: DEFAULT_GAS,
      gasPrice: DEFAULT_GAS_PRICE,
    }
  )

  return new Promise((resolve, reject) => {
    erc20contract
      .deploy({
        data: erc20.bytecode,
        arguments: [tokenName, tokenSymbol],
      })
      .send({ from })
      .on('receipt', function (receipt: any) {
        console.log('+++ erc20 receipt', receipt)
        resolve({
          ERC20Token: {
            address: receipt.contractAddress,
            receipt,
          },
        })
      })
      .once('sending', (payload: any) => {
        console.log('+++ erc20 sending', JSON.stringify(payload, null, 2))
      })
      .catch(reject)
  })
}

export function useERC20(): {
  deployERC20Token: (
    erc20DeploymentOptions: ERC20DeploymentOptions
  ) => Promise<DeployedERC20Token>
} {
  const hasExtension = !!window.ethereum
  if (!hasExtension) {
    throw new Error('Extension not installed')
  }

  return {
    deployERC20Token,
  }
}
