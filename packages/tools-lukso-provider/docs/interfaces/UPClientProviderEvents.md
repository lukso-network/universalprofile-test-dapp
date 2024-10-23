[**@lukso/embedded-provider**](../README.md) • **Docs**

***

[@lukso/embedded-provider](../globals.md) / UPClientProviderEvents

# Interface: UPClientProviderEvents

## Properties

### accountsChanged()

> **accountsChanged**: (`accounts`) => `void`

#### Parameters

• **accounts**: (`""` \| \`0x$\{string\}\`)[]

#### Returns

`void`

#### Defined in

[packages/tools-lukso-provider/src/client.ts:21](https://github.com/lukso-network/universalprofile-test-dapp/blob/aca91b0b45c39879daeb5b9f9b46717028f73a74/packages/tools-lukso-provider/src/client.ts#L21)

***

### chainChanged()

> **chainChanged**: (`chainId`) => `void`

#### Parameters

• **chainId**: `number`

#### Returns

`void`

#### Defined in

[packages/tools-lukso-provider/src/client.ts:23](https://github.com/lukso-network/universalprofile-test-dapp/blob/aca91b0b45c39879daeb5b9f9b46717028f73a74/packages/tools-lukso-provider/src/client.ts#L23)

***

### connected()

> **connected**: () => `void`

#### Returns

`void`

#### Defined in

[packages/tools-lukso-provider/src/client.ts:19](https://github.com/lukso-network/universalprofile-test-dapp/blob/aca91b0b45c39879daeb5b9f9b46717028f73a74/packages/tools-lukso-provider/src/client.ts#L19)

***

### disconnected()

> **disconnected**: () => `void`

#### Returns

`void`

#### Defined in

[packages/tools-lukso-provider/src/client.ts:20](https://github.com/lukso-network/universalprofile-test-dapp/blob/aca91b0b45c39879daeb5b9f9b46717028f73a74/packages/tools-lukso-provider/src/client.ts#L20)

***

### injected()

> **injected**: (`page`) => `void`

#### Parameters

• **page**: `""` \| \`0x$\{string\}\`

#### Returns

`void`

#### Defined in

[packages/tools-lukso-provider/src/client.ts:24](https://github.com/lukso-network/universalprofile-test-dapp/blob/aca91b0b45c39879daeb5b9f9b46717028f73a74/packages/tools-lukso-provider/src/client.ts#L24)

***

### requestAccounts()

> **requestAccounts**: (`accounts`) => `void`

#### Parameters

• **accounts**: (`""` \| \`0x$\{string\}\`)[]

#### Returns

`void`

#### Defined in

[packages/tools-lukso-provider/src/client.ts:22](https://github.com/lukso-network/universalprofile-test-dapp/blob/aca91b0b45c39879daeb5b9f9b46717028f73a74/packages/tools-lukso-provider/src/client.ts#L22)

***

### rpcUrls()

> **rpcUrls**: (`rpcUrls`) => `void`

#### Parameters

• **rpcUrls**: `string`[]

#### Returns

`void`

#### Defined in

[packages/tools-lukso-provider/src/client.ts:25](https://github.com/lukso-network/universalprofile-test-dapp/blob/aca91b0b45c39879daeb5b9f9b46717028f73a74/packages/tools-lukso-provider/src/client.ts#L25)
