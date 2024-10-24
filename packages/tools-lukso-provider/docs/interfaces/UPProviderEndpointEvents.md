[**@lukso/embedded-provider**](../README.md) • **Docs**

***

[@lukso/embedded-provider](../globals.md) / UPProviderEndpointEvents

# Interface: UPProviderEndpointEvents

## Properties

### accountsChanged()

> **accountsChanged**: (`accounts`) => `void`

#### Parameters

• **accounts**: (`""` \| \`0x$\{string\}\`)[]

#### Returns

`void`

#### Defined in

[packages/tools-lukso-provider/src/server.ts:199](https://github.com/lukso-network/universalprofile-test-dapp/blob/76390a481233271abc57cda0cbb2b69afd9acb37/packages/tools-lukso-provider/src/server.ts#L199)

***

### chainChanged()

> **chainChanged**: (`chainId`) => `void`

#### Parameters

• **chainId**: `number`

#### Returns

`void`

#### Defined in

[packages/tools-lukso-provider/src/server.ts:200](https://github.com/lukso-network/universalprofile-test-dapp/blob/76390a481233271abc57cda0cbb2b69afd9acb37/packages/tools-lukso-provider/src/server.ts#L200)

***

### connect()

> **connect**: (`__namedParameters`) => `void`

#### Parameters

• **\_\_namedParameters**

• **\_\_namedParameters.chainId**: `number`

#### Returns

`void`

#### Defined in

[packages/tools-lukso-provider/src/server.ts:201](https://github.com/lukso-network/universalprofile-test-dapp/blob/76390a481233271abc57cda0cbb2b69afd9acb37/packages/tools-lukso-provider/src/server.ts#L201)

***

### disconnect()

> **disconnect**: (`error`) => `void`

#### Parameters

• **error**: `Error`

#### Returns

`void`

#### Defined in

[packages/tools-lukso-provider/src/server.ts:202](https://github.com/lukso-network/universalprofile-test-dapp/blob/76390a481233271abc57cda0cbb2b69afd9acb37/packages/tools-lukso-provider/src/server.ts#L202)
