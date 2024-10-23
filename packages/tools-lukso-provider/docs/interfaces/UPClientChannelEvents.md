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

[packages/tools-lukso-provider/src/server.ts:14](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/server.ts#L14)

***

### chainChanged()

> **chainChanged**: (`chainId`) => `void`

#### Parameters

• **chainId**: `number`

#### Returns

`void`

#### Defined in

[packages/tools-lukso-provider/src/server.ts:16](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/server.ts#L16)

***

### connected()

> **connected**: () => `void`

#### Returns

`void`

#### Defined in

[packages/tools-lukso-provider/src/server.ts:12](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/server.ts#L12)

***

### disconnected()

> **disconnected**: () => `void`

#### Returns

`void`

#### Defined in

[packages/tools-lukso-provider/src/server.ts:13](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/server.ts#L13)

***

### injected()

> **injected**: (`accounts`) => `void`

#### Parameters

• **accounts**: (`""` \| \`0x$\{string\}\`)[]

#### Returns

`void`

#### Defined in

[packages/tools-lukso-provider/src/server.ts:17](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/server.ts#L17)

***

### requestAccounts()

> **requestAccounts**: (`accounts`) => `void`

#### Parameters

• **accounts**: (`""` \| \`0x$\{string\}\`)[]

#### Returns

`void`

#### Defined in

[packages/tools-lukso-provider/src/server.ts:15](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/server.ts#L15)
