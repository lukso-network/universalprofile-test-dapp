import { AbiItem } from 'web3-utils'

import erc721 from '@openzeppelin/contracts/build/contracts/ERC777.json'

export const erc777ABI: AbiItem[] = erc721.abi as AbiItem[]
