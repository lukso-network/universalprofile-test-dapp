import { DeployedContract } from '@lukso/lsp-factory.js'

import erc20AndErc165 from '../abis/CustomERC20AndERC165/CustomERC20AndERC165.json'
import useWeb3 from './useWeb3'
import { DEFAULT_GAS, DEFAULT_GAS_PRICE } from '@/helpers/config'
import useWeb3Onboard from './useWeb3Onboard'

interface ERC20DeploymentOptions {
  from: string
  tokenName: string
  tokenSymbol: string
}

interface DeployedERC20Token {
  ERC20Token: DeployedContract
}

const { getWeb3OnboardProvider } = useWeb3Onboard()

async function deployERC20Token({
  from,
  tokenName,
  tokenSymbol,
}: ERC20DeploymentOptions): Promise<DeployedERC20Token> {
  const { contract } = useWeb3()
  const erc20contract = contract(erc20AndErc165.abi as any, from, {
    gas: DEFAULT_GAS,
    gasPrice: DEFAULT_GAS_PRICE,
  })

  return new Promise((resolve, reject) => {
    erc20contract
      .deploy({
        data: erc20AndErc165.bytecode,
        arguments: [tokenName, tokenSymbol],
      })
      .send({ from })
      .on('receipt', function (receipt: any) {
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
  const hasExtension = !!getWeb3OnboardProvider()
  if (!hasExtension) {
    throw new Error('Extension not installed')
  }

  return {
    deployERC20Token,
  }
}
