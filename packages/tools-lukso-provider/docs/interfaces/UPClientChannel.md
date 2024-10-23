[**@lukso/embedded-provider**](../README.md) • **Docs**

***

[@lukso/embedded-provider](../globals.md) / UPClientChannel

# Interface: UPClientChannel

## Properties

### element

> `readonly` **element**: `null` \| `HTMLIFrameElement`

#### Defined in

[packages/tools-lukso-provider/src/server.ts:22](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/server.ts#L22)

***

### id

> `readonly` **id**: `string`

#### Defined in

[packages/tools-lukso-provider/src/server.ts:23](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/server.ts#L23)

***

### window

> `readonly` **window**: `Window`

#### Defined in

[packages/tools-lukso-provider/src/server.ts:21](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/server.ts#L21)

## Accessors

### accounts

> `get` **accounts**(): (`""` \| \`0x$\{string\}\`)[]

#### Returns

(`""` \| \`0x$\{string\}\`)[]

#### Defined in

[packages/tools-lukso-provider/src/server.ts:97](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/server.ts#L97)

***

### enabled

> `get` **enabled**(): `boolean`

> `set` **enabled**(`value`): `void`

#### Parameters

• **value**: `boolean`

#### Returns

`boolean`

#### Defined in

[packages/tools-lukso-provider/src/server.ts:105](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/server.ts#L105)

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

[packages/tools-lukso-provider/src/server.ts:59](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/server.ts#L59)

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

[packages/tools-lukso-provider/src/server.ts:100](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/server.ts#L100)

***

### close()

> **close**(): `void`

#### Returns

`void`

#### Defined in

[packages/tools-lukso-provider/src/server.ts:109](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/server.ts#L109)

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

[packages/tools-lukso-provider/src/server.ts:46](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/server.ts#L46)

***

### eventNames()

> **eventNames**(): keyof [`UPClientChannelEvents`](UPClientChannelEvents.md)[]

Return an array listing the events for which the emitter has registered
listeners.

#### Returns

keyof [`UPClientChannelEvents`](UPClientChannelEvents.md)[]

#### Defined in

[packages/tools-lukso-provider/src/server.ts:29](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/server.ts#L29)

***

### listenerCount()

> **listenerCount**(`event`): `number`

Return the number of listeners listening to a given event.

#### Parameters

• **event**: keyof [`UPClientChannelEvents`](UPClientChannelEvents.md)

#### Returns

`number`

#### Defined in

[packages/tools-lukso-provider/src/server.ts:41](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/server.ts#L41)

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

[packages/tools-lukso-provider/src/server.ts:34](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/server.ts#L34)

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

[packages/tools-lukso-provider/src/server.ts:83](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/server.ts#L83)

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

[packages/tools-lukso-provider/src/server.ts:54](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/server.ts#L54)

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

[packages/tools-lukso-provider/src/server.ts:68](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/server.ts#L68)

***

### removeAllListeners()

> **removeAllListeners**(`event`?): `this`

Remove all listeners, or those of the specified event.

#### Parameters

• **event?**: keyof UPClientChannelEvents

#### Returns

`this`

#### Defined in

[packages/tools-lukso-provider/src/server.ts:93](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/server.ts#L93)

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

[packages/tools-lukso-provider/src/server.ts:77](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/server.ts#L77)

***

### resume()

> **resume**(`delay`): `void`

#### Parameters

• **delay**: `number`

#### Returns

`void`

#### Defined in

[packages/tools-lukso-provider/src/server.ts:98](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/server.ts#L98)

***

### send()

> **send**(`method`, `params`): `Promise`\<`void`\>

#### Parameters

• **method**: `string`

• **params**: `unknown`[]

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/tools-lukso-provider/src/server.ts:99](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/server.ts#L99)

***

### setChainId()

> **setChainId**(`chainId`): `Promise`\<`void`\>

#### Parameters

• **chainId**: `number`

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/tools-lukso-provider/src/server.ts:107](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/server.ts#L107)

***

### setRpcUrls()

> **setRpcUrls**(`rpcUrls`): `Promise`\<`void`\>

#### Parameters

• **rpcUrls**: `string`[]

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/tools-lukso-provider/src/server.ts:108](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/server.ts#L108)
