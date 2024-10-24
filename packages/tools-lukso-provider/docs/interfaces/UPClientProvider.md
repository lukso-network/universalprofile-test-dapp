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

[packages/tools-lukso-provider/src/client.ts:94](https://github.com/lukso-network/universalprofile-test-dapp/blob/76390a481233271abc57cda0cbb2b69afd9acb37/packages/tools-lukso-provider/src/client.ts#L94)

***

### chainId

> `get` **chainId**(): `number`

#### Returns

`number`

#### Defined in

[packages/tools-lukso-provider/src/client.ts:92](https://github.com/lukso-network/universalprofile-test-dapp/blob/76390a481233271abc57cda0cbb2b69afd9acb37/packages/tools-lukso-provider/src/client.ts#L92)

***

### isConnected

> `get` **isConnected**(): `boolean`

#### Returns

`boolean`

#### Defined in

[packages/tools-lukso-provider/src/client.ts:96](https://github.com/lukso-network/universalprofile-test-dapp/blob/76390a481233271abc57cda0cbb2b69afd9acb37/packages/tools-lukso-provider/src/client.ts#L96)

***

### isUPClientProvider

> `get` **isUPClientProvider**(): `boolean`

#### Returns

`boolean`

#### Defined in

[packages/tools-lukso-provider/src/client.ts:45](https://github.com/lukso-network/universalprofile-test-dapp/blob/76390a481233271abc57cda0cbb2b69afd9acb37/packages/tools-lukso-provider/src/client.ts#L45)

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

[packages/tools-lukso-provider/src/client.ts:71](https://github.com/lukso-network/universalprofile-test-dapp/blob/76390a481233271abc57cda0cbb2b69afd9acb37/packages/tools-lukso-provider/src/client.ts#L71)

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

[packages/tools-lukso-provider/src/client.ts:65](https://github.com/lukso-network/universalprofile-test-dapp/blob/76390a481233271abc57cda0cbb2b69afd9acb37/packages/tools-lukso-provider/src/client.ts#L65)

***

### eventNames()

> **eventNames**(): keyof [`UPClientProviderEvents`](UPClientProviderEvents.md)[]

Return an array listing the events for which the emitter has registered
listeners.

#### Returns

keyof [`UPClientProviderEvents`](UPClientProviderEvents.md)[]

#### Defined in

[packages/tools-lukso-provider/src/client.ts:50](https://github.com/lukso-network/universalprofile-test-dapp/blob/76390a481233271abc57cda0cbb2b69afd9acb37/packages/tools-lukso-provider/src/client.ts#L50)

***

### listenerCount()

> **listenerCount**(`event`): `number`

Return the number of listeners listening to a given event.

#### Parameters

• **event**: keyof [`UPClientProviderEvents`](UPClientProviderEvents.md)

#### Returns

`number`

#### Defined in

[packages/tools-lukso-provider/src/client.ts:60](https://github.com/lukso-network/universalprofile-test-dapp/blob/76390a481233271abc57cda0cbb2b69afd9acb37/packages/tools-lukso-provider/src/client.ts#L60)

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

[packages/tools-lukso-provider/src/client.ts:55](https://github.com/lukso-network/universalprofile-test-dapp/blob/76390a481233271abc57cda0cbb2b69afd9acb37/packages/tools-lukso-provider/src/client.ts#L55)

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

[packages/tools-lukso-provider/src/client.ts:82](https://github.com/lukso-network/universalprofile-test-dapp/blob/76390a481233271abc57cda0cbb2b69afd9acb37/packages/tools-lukso-provider/src/client.ts#L82)

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

[packages/tools-lukso-provider/src/client.ts:70](https://github.com/lukso-network/universalprofile-test-dapp/blob/76390a481233271abc57cda0cbb2b69afd9acb37/packages/tools-lukso-provider/src/client.ts#L70)

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

[packages/tools-lukso-provider/src/client.ts:76](https://github.com/lukso-network/universalprofile-test-dapp/blob/76390a481233271abc57cda0cbb2b69afd9acb37/packages/tools-lukso-provider/src/client.ts#L76)

***

### removeAllListeners()

> **removeAllListeners**(`event`?): `this`

Remove all listeners, or those of the specified event.

#### Parameters

• **event?**: keyof UPClientProviderEvents

#### Returns

`this`

#### Defined in

[packages/tools-lukso-provider/src/client.ts:87](https://github.com/lukso-network/universalprofile-test-dapp/blob/76390a481233271abc57cda0cbb2b69afd9acb37/packages/tools-lukso-provider/src/client.ts#L87)

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

[packages/tools-lukso-provider/src/client.ts:81](https://github.com/lukso-network/universalprofile-test-dapp/blob/76390a481233271abc57cda0cbb2b69afd9acb37/packages/tools-lukso-provider/src/client.ts#L81)

***

### request()

#### request(method, params, clientParams)

> **request**(`method`, `params`, `clientParams`): `Promise`\<`any`\>

##### Parameters

• **method**: `string`

• **params**: `any`

• **clientParams**: `any`

##### Returns

`Promise`\<`any`\>

##### Defined in

[packages/tools-lukso-provider/src/client.ts:89](https://github.com/lukso-network/universalprofile-test-dapp/blob/76390a481233271abc57cda0cbb2b69afd9acb37/packages/tools-lukso-provider/src/client.ts#L89)

#### request(method, clientParams)

> **request**(`method`, `clientParams`): `Promise`\<`any`\>

##### Parameters

• **method**

• **method.method**: `string`

• **method.params**: `any`

• **clientParams**: `any`

##### Returns

`Promise`\<`any`\>

##### Defined in

[packages/tools-lukso-provider/src/client.ts:90](https://github.com/lukso-network/universalprofile-test-dapp/blob/76390a481233271abc57cda0cbb2b69afd9acb37/packages/tools-lukso-provider/src/client.ts#L90)
