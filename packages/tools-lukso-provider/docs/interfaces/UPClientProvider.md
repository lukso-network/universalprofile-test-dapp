[**@lukso/embedded-provider**](../README.md) • **Docs**

***

[@lukso/embedded-provider](../globals.md) / UPClientProvider

# Interface: UPClientProvider

## Accessors

### accounts

> `get` **accounts**(): (`""` \| \`0x$\{string\}\`)[]

#### Returns

(`""` \| \`0x$\{string\}\`)[]

#### Defined in

[packages/tools-lukso-provider/src/client.ts:126](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/client.ts#L126)

***

### chainId

> `get` **chainId**(): `number`

#### Returns

`number`

#### Defined in

[packages/tools-lukso-provider/src/client.ts:124](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/client.ts#L124)

***

### isUPClientProvider

> `get` **isUPClientProvider**(): `boolean`

#### Returns

`boolean`

#### Defined in

[packages/tools-lukso-provider/src/client.ts:45](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/client.ts#L45)

## Methods

### addListener()

> **addListener**\<`T`\>(`event`, `fn`, `context`?): `this`

#### Type Parameters

• **T** *extends* keyof [`UPClientProviderEvents`](UPClientProviderEvents.md)

#### Parameters

• **event**: `T`

• **fn**

• **context?**: `any`

#### Returns

`this`

#### Defined in

[packages/tools-lukso-provider/src/client.ts:80](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/client.ts#L80)

***

### emit()

> **emit**\<`T`\>(`event`, ...`args`): `boolean`

Calls each of the listeners registered for a given event.

#### Type Parameters

• **T** *extends* keyof [`UPClientProviderEvents`](UPClientProviderEvents.md)

#### Parameters

• **event**: `T`

• ...**args**: `ArgumentMap`\<[`UPClientProviderEvents`](UPClientProviderEvents.md)\>\[`Extract`\<`T`, keyof [`UPClientProviderEvents`](UPClientProviderEvents.md)\>\]

#### Returns

`boolean`

#### Defined in

[packages/tools-lukso-provider/src/client.ts:67](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/client.ts#L67)

***

### eventNames()

> **eventNames**(): keyof [`UPClientProviderEvents`](UPClientProviderEvents.md)[]

Return an array listing the events for which the emitter has registered
listeners.

#### Returns

keyof [`UPClientProviderEvents`](UPClientProviderEvents.md)[]

#### Defined in

[packages/tools-lukso-provider/src/client.ts:50](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/client.ts#L50)

***

### listenerCount()

> **listenerCount**(`event`): `number`

Return the number of listeners listening to a given event.

#### Parameters

• **event**: keyof [`UPClientProviderEvents`](UPClientProviderEvents.md)

#### Returns

`number`

#### Defined in

[packages/tools-lukso-provider/src/client.ts:62](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/client.ts#L62)

***

### listeners()

> **listeners**\<`T`\>(`event`): (...`args`) => `void`[]

Return the listeners registered for a given event.

#### Type Parameters

• **T** *extends* keyof [`UPClientProviderEvents`](UPClientProviderEvents.md)

#### Parameters

• **event**: `T`

#### Returns

(...`args`) => `void`[]

#### Defined in

[packages/tools-lukso-provider/src/client.ts:55](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/client.ts#L55)

***

### off()

> **off**\<`T`\>(`event`, `fn`?, `context`?, `once`?): `this`

#### Type Parameters

• **T** *extends* keyof [`UPClientProviderEvents`](UPClientProviderEvents.md)

#### Parameters

• **event**: `T`

• **fn?**

• **context?**: `any`

• **once?**: `boolean`

#### Returns

`this`

#### Defined in

[packages/tools-lukso-provider/src/client.ts:104](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/client.ts#L104)

***

### on()

> **on**\<`T`\>(`event`, `fn`, `context`?): `this`

Add a listener for a given event.

#### Type Parameters

• **T** *extends* keyof [`UPClientProviderEvents`](UPClientProviderEvents.md)

#### Parameters

• **event**: `T`

• **fn**

• **context?**: `any`

#### Returns

`this`

#### Defined in

[packages/tools-lukso-provider/src/client.ts:75](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/client.ts#L75)

***

### once()

> **once**\<`T`\>(`event`, `fn`, `context`?): `this`

Add a one-time listener for a given event.

#### Type Parameters

• **T** *extends* keyof [`UPClientProviderEvents`](UPClientProviderEvents.md)

#### Parameters

• **event**: `T`

• **fn**

• **context?**: `any`

#### Returns

`this`

#### Defined in

[packages/tools-lukso-provider/src/client.ts:89](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/client.ts#L89)

***

### removeAllListeners()

> **removeAllListeners**(`event`?): `this`

Remove all listeners, or those of the specified event.

#### Parameters

• **event?**: keyof UPClientProviderEvents

#### Returns

`this`

#### Defined in

[packages/tools-lukso-provider/src/client.ts:114](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/client.ts#L114)

***

### removeListener()

> **removeListener**\<`T`\>(`event`, `fn`?, `context`?, `once`?): `this`

Remove the listeners of a given event.

#### Type Parameters

• **T** *extends* keyof [`UPClientProviderEvents`](UPClientProviderEvents.md)

#### Parameters

• **event**: `T`

• **fn?**

• **context?**: `any`

• **once?**: `boolean`

#### Returns

`this`

#### Defined in

[packages/tools-lukso-provider/src/client.ts:98](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/client.ts#L98)

***

### request()

> **request**(`method`, `params`, `clientParams`): `Promise`\<`any`\>

#### Parameters

• **method**: `string`

• **params**: `any`

• **clientParams**: `any`

#### Returns

`Promise`\<`any`\>

#### Defined in

[packages/tools-lukso-provider/src/client.ts:118](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/client.ts#L118)
