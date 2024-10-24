[**@lukso/embedded-provider**](../README.md) • **Docs**

***

[@lukso/embedded-provider](../globals.md) / UPClientChannelEvents

# Interface: UPClientChannelEvents

## Properties

### accountsChanged()

> **accountsChanged**: (`accounts`) => `void`

#### Parameters

• **accounts**: (`""` \| \`0x$\{string\}\`)[]

#### Returns

`void`

#### Defined in

[packages/tools-lukso-provider/src/server.ts:10](https://github.com/lukso-network/universalprofile-test-dapp/blob/76390a481233271abc57cda0cbb2b69afd9acb37/packages/tools-lukso-provider/src/server.ts#L10)

***

### chainChanged()

> **chainChanged**: (`chainId`) => `void`

#### Parameters

• **chainId**: `number`

#### Returns

`void`

#### Defined in

[packages/tools-lukso-provider/src/server.ts:12](https://github.com/lukso-network/universalprofile-test-dapp/blob/76390a481233271abc57cda0cbb2b69afd9acb37/packages/tools-lukso-provider/src/server.ts#L12)

***

### connected()

> **connected**: () => `void`

#### Returns

`void`

#### Defined in

[packages/tools-lukso-provider/src/server.ts:8](https://github.com/lukso-network/universalprofile-test-dapp/blob/76390a481233271abc57cda0cbb2b69afd9acb37/packages/tools-lukso-provider/src/server.ts#L8)

***

### disconnected()

> **disconnected**: () => `void`

#### Returns

`void`

#### Defined in

[packages/tools-lukso-provider/src/server.ts:9](https://github.com/lukso-network/universalprofile-test-dapp/blob/76390a481233271abc57cda0cbb2b69afd9acb37/packages/tools-lukso-provider/src/server.ts#L9)

***

### injected()

> **injected**: (`accounts`) => `void`

#### Parameters

• **accounts**: (`""` \| \`0x$\{string\}\`)[]

#### Returns

`void`

#### Defined in

[packages/tools-lukso-provider/src/server.ts:13](https://github.com/lukso-network/universalprofile-test-dapp/blob/76390a481233271abc57cda0cbb2b69afd9acb37/packages/tools-lukso-provider/src/server.ts#L13)

***

### requestAccounts()

> **requestAccounts**: (`accounts`) => `void`

#### Parameters

• **accounts**: (`""` \| \`0x$\{string\}\`)[]

#### Returns

`void`

#### Defined in

[packages/tools-lukso-provider/src/server.ts:11](https://github.com/lukso-network/universalprofile-test-dapp/blob/76390a481233271abc57cda0cbb2b69afd9acb37/packages/tools-lukso-provider/src/server.ts#L11)
