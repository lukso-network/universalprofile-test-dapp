[**@lukso/embedded-provider**](../README.md) • **Docs**

***

[@lukso/embedded-provider](../globals.md) / UPClientChannel

# Interface: UPClientChannel

## Properties

### element

> `readonly` **element**: `null` \| `HTMLIFrameElement`

#### Defined in

[packages/tools-lukso-provider/src/server.ts:18](https://github.com/lukso-network/universalprofile-test-dapp/blob/aca91b0b45c39879daeb5b9f9b46717028f73a74/packages/tools-lukso-provider/src/server.ts#L18)

***

### id

> `readonly` **id**: `string`

#### Defined in

[packages/tools-lukso-provider/src/server.ts:19](https://github.com/lukso-network/universalprofile-test-dapp/blob/aca91b0b45c39879daeb5b9f9b46717028f73a74/packages/tools-lukso-provider/src/server.ts#L19)

***

### window

> `readonly` **window**: `Window`

#### Defined in

[packages/tools-lukso-provider/src/server.ts:17](https://github.com/lukso-network/universalprofile-test-dapp/blob/aca91b0b45c39879daeb5b9f9b46717028f73a74/packages/tools-lukso-provider/src/server.ts#L17)

## Accessors

### accounts

> `get` **accounts**(): (`""` \| \`0x$\{string\}\`)[]

#### Returns

(`""` \| \`0x$\{string\}\`)[]

#### Defined in

[packages/tools-lukso-provider/src/server.ts:64](https://github.com/lukso-network/universalprofile-test-dapp/blob/aca91b0b45c39879daeb5b9f9b46717028f73a74/packages/tools-lukso-provider/src/server.ts#L64)

***

### enabled

> `get` **enabled**(): `boolean`

> `set` **enabled**(`value`): `void`

#### Parameters

• **value**: `boolean`

#### Returns

`boolean`

#### Defined in

[packages/tools-lukso-provider/src/server.ts:68](https://github.com/lukso-network/universalprofile-test-dapp/blob/aca91b0b45c39879daeb5b9f9b46717028f73a74/packages/tools-lukso-provider/src/server.ts#L68)

## Methods

### addListener()

> **addListener**\<`T`\>(`event`, `fn`, `context`?): `this`

#### Type Parameters

• **T** *extends* keyof [`UPClientChannelEvents`](UPClientChannelEvents.md)

#### Parameters

• **event**: `T`

• **fn**

• **context?**: `any`

#### Returns

`this`

#### Defined in

[packages/tools-lukso-provider/src/server.ts:46](https://github.com/lukso-network/universalprofile-test-dapp/blob/aca91b0b45c39879daeb5b9f9b46717028f73a74/packages/tools-lukso-provider/src/server.ts#L46)

***

### allowAccounts()

> **allowAccounts**(`enabled`, `__namedParameters`, `chainId`): `Promise`\<`void`\>

#### Parameters

• **enabled**: `boolean`

• **\_\_namedParameters**: (`""` \| \`0x$\{string\}\`)[]

• **chainId**: `number`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/tools-lukso-provider/src/server.ts:67](https://github.com/lukso-network/universalprofile-test-dapp/blob/aca91b0b45c39879daeb5b9f9b46717028f73a74/packages/tools-lukso-provider/src/server.ts#L67)

***

### close()

> **close**(): `void`

#### Returns

`void`

#### Defined in

[packages/tools-lukso-provider/src/server.ts:72](https://github.com/lukso-network/universalprofile-test-dapp/blob/aca91b0b45c39879daeb5b9f9b46717028f73a74/packages/tools-lukso-provider/src/server.ts#L72)

***

### emit()

> **emit**\<`T`\>(`event`, ...`args`): `boolean`

Calls each of the listeners registered for a given event.

#### Type Parameters

• **T** *extends* keyof [`UPClientChannelEvents`](UPClientChannelEvents.md)

#### Parameters

• **event**: `T`

• ...**args**: `ArgumentMap`\<[`UPClientChannelEvents`](UPClientChannelEvents.md)\>\[`Extract`\<`T`, keyof [`UPClientChannelEvents`](UPClientChannelEvents.md)\>\]

#### Returns

`boolean`

#### Defined in

[packages/tools-lukso-provider/src/server.ts:40](https://github.com/lukso-network/universalprofile-test-dapp/blob/aca91b0b45c39879daeb5b9f9b46717028f73a74/packages/tools-lukso-provider/src/server.ts#L40)

***

### eventNames()

> **eventNames**(): keyof [`UPClientChannelEvents`](UPClientChannelEvents.md)[]

Return an array listing the events for which the emitter has registered
listeners.

#### Returns

keyof [`UPClientChannelEvents`](UPClientChannelEvents.md)[]

#### Defined in

[packages/tools-lukso-provider/src/server.ts:25](https://github.com/lukso-network/universalprofile-test-dapp/blob/aca91b0b45c39879daeb5b9f9b46717028f73a74/packages/tools-lukso-provider/src/server.ts#L25)

***

### listenerCount()

> **listenerCount**(`event`): `number`

Return the number of listeners listening to a given event.

#### Parameters

• **event**: keyof [`UPClientChannelEvents`](UPClientChannelEvents.md)

#### Returns

`number`

#### Defined in

[packages/tools-lukso-provider/src/server.ts:35](https://github.com/lukso-network/universalprofile-test-dapp/blob/aca91b0b45c39879daeb5b9f9b46717028f73a74/packages/tools-lukso-provider/src/server.ts#L35)

***

### listeners()

> **listeners**\<`T`\>(`event`): (...`args`) => `void`[]

Return the listeners registered for a given event.

#### Type Parameters

• **T** *extends* keyof [`UPClientChannelEvents`](UPClientChannelEvents.md)

#### Parameters

• **event**: `T`

#### Returns

(...`args`) => `void`[]

#### Defined in

[packages/tools-lukso-provider/src/server.ts:30](https://github.com/lukso-network/universalprofile-test-dapp/blob/aca91b0b45c39879daeb5b9f9b46717028f73a74/packages/tools-lukso-provider/src/server.ts#L30)

***

### off()

> **off**\<`T`\>(`event`, `fn`?, `context`?, `once`?): `this`

#### Type Parameters

• **T** *extends* keyof [`UPClientChannelEvents`](UPClientChannelEvents.md)

#### Parameters

• **event**: `T`

• **fn?**

• **context?**: `any`

• **once?**: `boolean`

#### Returns

`this`

#### Defined in

[packages/tools-lukso-provider/src/server.ts:57](https://github.com/lukso-network/universalprofile-test-dapp/blob/aca91b0b45c39879daeb5b9f9b46717028f73a74/packages/tools-lukso-provider/src/server.ts#L57)

***

### on()

> **on**\<`T`\>(`event`, `fn`, `context`?): `this`

Add a listener for a given event.

#### Type Parameters

• **T** *extends* keyof [`UPClientChannelEvents`](UPClientChannelEvents.md)

#### Parameters

• **event**: `T`

• **fn**

• **context?**: `any`

#### Returns

`this`

#### Defined in

[packages/tools-lukso-provider/src/server.ts:45](https://github.com/lukso-network/universalprofile-test-dapp/blob/aca91b0b45c39879daeb5b9f9b46717028f73a74/packages/tools-lukso-provider/src/server.ts#L45)

***

### once()

> **once**\<`T`\>(`event`, `fn`, `context`?): `this`

Add a one-time listener for a given event.

#### Type Parameters

• **T** *extends* keyof [`UPClientChannelEvents`](UPClientChannelEvents.md)

#### Parameters

• **event**: `T`

• **fn**

• **context?**: `any`

#### Returns

`this`

#### Defined in

[packages/tools-lukso-provider/src/server.ts:51](https://github.com/lukso-network/universalprofile-test-dapp/blob/aca91b0b45c39879daeb5b9f9b46717028f73a74/packages/tools-lukso-provider/src/server.ts#L51)

***

### removeAllListeners()

> **removeAllListeners**(`event`?): `this`

Remove all listeners, or those of the specified event.

#### Parameters

• **event?**: keyof UPClientChannelEvents

#### Returns

`this`

#### Defined in

[packages/tools-lukso-provider/src/server.ts:62](https://github.com/lukso-network/universalprofile-test-dapp/blob/aca91b0b45c39879daeb5b9f9b46717028f73a74/packages/tools-lukso-provider/src/server.ts#L62)

***

### removeListener()

> **removeListener**\<`T`\>(`event`, `fn`?, `context`?, `once`?): `this`

Remove the listeners of a given event.

#### Type Parameters

• **T** *extends* keyof [`UPClientChannelEvents`](UPClientChannelEvents.md)

#### Parameters

• **event**: `T`

• **fn?**

• **context?**: `any`

• **once?**: `boolean`

#### Returns

`this`

#### Defined in

[packages/tools-lukso-provider/src/server.ts:56](https://github.com/lukso-network/universalprofile-test-dapp/blob/aca91b0b45c39879daeb5b9f9b46717028f73a74/packages/tools-lukso-provider/src/server.ts#L56)

***

### resume()

> **resume**(`delay`): `void`

#### Parameters

• **delay**: `number`

#### Returns

`void`

#### Defined in

[packages/tools-lukso-provider/src/server.ts:65](https://github.com/lukso-network/universalprofile-test-dapp/blob/aca91b0b45c39879daeb5b9f9b46717028f73a74/packages/tools-lukso-provider/src/server.ts#L65)

***

### send()

> **send**(`method`, `params`): `Promise`\<`void`\>

#### Parameters

• **method**: `string`

• **params**: `unknown`[]

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/tools-lukso-provider/src/server.ts:66](https://github.com/lukso-network/universalprofile-test-dapp/blob/aca91b0b45c39879daeb5b9f9b46717028f73a74/packages/tools-lukso-provider/src/server.ts#L66)

***

### setChainId()

> **setChainId**(`chainId`): `Promise`\<`void`\>

#### Parameters

• **chainId**: `number`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/tools-lukso-provider/src/server.ts:70](https://github.com/lukso-network/universalprofile-test-dapp/blob/aca91b0b45c39879daeb5b9f9b46717028f73a74/packages/tools-lukso-provider/src/server.ts#L70)

***

### setRpcUrls()

> **setRpcUrls**(`rpcUrls`): `Promise`\<`void`\>

#### Parameters

• **rpcUrls**: `string`[]

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/tools-lukso-provider/src/server.ts:71](https://github.com/lukso-network/universalprofile-test-dapp/blob/aca91b0b45c39879daeb5b9f9b46717028f73a74/packages/tools-lukso-provider/src/server.ts#L71)
