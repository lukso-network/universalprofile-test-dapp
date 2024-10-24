[**@lukso/embedded-provider**](../README.md) • **Docs**

***

[@lukso/embedded-provider](../globals.md) / UPProviderConnector

# Interface: UPProviderConnector

API for provider connector

## Accessors

### accounts

> `get` **accounts**(): (`""` \| \`0x$\{string\}\`)[]

#### Returns

(`""` \| \`0x$\{string\}\`)[]

#### Defined in

[packages/tools-lukso-provider/src/server.ts:274](https://github.com/lukso-network/universalprofile-test-dapp/blob/76390a481233271abc57cda0cbb2b69afd9acb37/packages/tools-lukso-provider/src/server.ts#L274)

***

### channels

> `get` **channels**(): `Map`\<`string`, [`UPClientChannel`](UPClientChannel.md)\>

Get a map of all clients by their ID.

#### Returns

`Map`\<`string`, [`UPClientChannel`](UPClientChannel.md)\>

#### Defined in

[packages/tools-lukso-provider/src/server.ts:279](https://github.com/lukso-network/universalprofile-test-dapp/blob/76390a481233271abc57cda0cbb2b69afd9acb37/packages/tools-lukso-provider/src/server.ts#L279)

***

### provider

> `get` **provider**(): [`UPProviderEndpoint`](UPProviderEndpoint.md)

#### Returns

[`UPProviderEndpoint`](UPProviderEndpoint.md)

#### Defined in

[packages/tools-lukso-provider/src/server.ts:273](https://github.com/lukso-network/universalprofile-test-dapp/blob/76390a481233271abc57cda0cbb2b69afd9acb37/packages/tools-lukso-provider/src/server.ts#L273)

## Methods

### addListener()

> **addListener**\<`T`\>(`event`, `fn`, `context`?): `this`

#### Type Parameters

• **T** *extends* `"channelCreated"`

#### Parameters

• **event**: `T`

• **fn**

• **context?**: `any`

#### Returns

`this`

#### Defined in

[packages/tools-lukso-provider/src/server.ts:253](https://github.com/lukso-network/universalprofile-test-dapp/blob/76390a481233271abc57cda0cbb2b69afd9acb37/packages/tools-lukso-provider/src/server.ts#L253)

***

### close()

> **close**(): `void`

#### Returns

`void`

#### Defined in

[packages/tools-lukso-provider/src/server.ts:271](https://github.com/lukso-network/universalprofile-test-dapp/blob/76390a481233271abc57cda0cbb2b69afd9acb37/packages/tools-lukso-provider/src/server.ts#L271)

***

### emit()

> **emit**\<`T`\>(`event`, ...`args`): `boolean`

Calls each of the listeners registered for a given event.

#### Type Parameters

• **T** *extends* `"channelCreated"`

#### Parameters

• **event**: `T`

• ...**args**: `ArgumentMap`\<[`UPProviderConnectorEvents`](UPProviderConnectorEvents.md)\>\[`Extract`\<`T`, `"channelCreated"`\>\]

#### Returns

`boolean`

#### Defined in

[packages/tools-lukso-provider/src/server.ts:247](https://github.com/lukso-network/universalprofile-test-dapp/blob/76390a481233271abc57cda0cbb2b69afd9acb37/packages/tools-lukso-provider/src/server.ts#L247)

***

### eventNames()

> **eventNames**(): `"channelCreated"`[]

Return an array listing the events for which the emitter has registered
listeners.

#### Returns

`"channelCreated"`[]

#### Defined in

[packages/tools-lukso-provider/src/server.ts:232](https://github.com/lukso-network/universalprofile-test-dapp/blob/76390a481233271abc57cda0cbb2b69afd9acb37/packages/tools-lukso-provider/src/server.ts#L232)

***

### getChannel()

> **getChannel**(`id`): `null` \| [`UPClientChannel`](UPClientChannel.md)

Find the client for the element, window or proxy object of the client.

#### Parameters

• **id**: `null` \| `string` \| `Window` \| [`UPClientChannel`](UPClientChannel.md) \| `HTMLIFrameElement`

#### Returns

`null` \| [`UPClientChannel`](UPClientChannel.md)

actual UPClientChannel

#### Defined in

[packages/tools-lukso-provider/src/server.ts:286](https://github.com/lukso-network/universalprofile-test-dapp/blob/76390a481233271abc57cda0cbb2b69afd9acb37/packages/tools-lukso-provider/src/server.ts#L286)

***

### injectAddresses()

> **injectAddresses**(...`page`): `Promise`\<`void`\>

Inject additional addresses into the client's accountsChanged event.
Account[0] will be linked to the signed when making transactions.
Starting at Account[1] is where additional addresses are injected.
This routine injects on all connections. You can also inject using
the channel's allowAccounts method.

#### Parameters

• ...**page**: (`""` \| \`0x$\{string\}\`)[]

list of addresses

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/tools-lukso-provider/src/server.ts:296](https://github.com/lukso-network/universalprofile-test-dapp/blob/76390a481233271abc57cda0cbb2b69afd9acb37/packages/tools-lukso-provider/src/server.ts#L296)

***

### listenerCount()

> **listenerCount**(`event`): `number`

Return the number of listeners listening to a given event.

#### Parameters

• **event**: `"channelCreated"`

#### Returns

`number`

#### Defined in

[packages/tools-lukso-provider/src/server.ts:242](https://github.com/lukso-network/universalprofile-test-dapp/blob/76390a481233271abc57cda0cbb2b69afd9acb37/packages/tools-lukso-provider/src/server.ts#L242)

***

### listeners()

> **listeners**\<`T`\>(`event`): (...`args`) => `void`[]

Return the listeners registered for a given event.

#### Type Parameters

• **T** *extends* `"channelCreated"`

#### Parameters

• **event**: `T`

#### Returns

(...`args`) => `void`[]

#### Defined in

[packages/tools-lukso-provider/src/server.ts:237](https://github.com/lukso-network/universalprofile-test-dapp/blob/76390a481233271abc57cda0cbb2b69afd9acb37/packages/tools-lukso-provider/src/server.ts#L237)

***

### off()

> **off**\<`T`\>(`event`, `fn`?, `context`?, `once`?): `this`

#### Type Parameters

• **T** *extends* `"channelCreated"`

#### Parameters

• **event**: `T`

• **fn?**

• **context?**: `any`

• **once?**: `boolean`

#### Returns

`this`

#### Defined in

[packages/tools-lukso-provider/src/server.ts:264](https://github.com/lukso-network/universalprofile-test-dapp/blob/76390a481233271abc57cda0cbb2b69afd9acb37/packages/tools-lukso-provider/src/server.ts#L264)

***

### on()

> **on**\<`T`\>(`event`, `fn`, `context`?): `this`

Add a listener for a given event.

#### Type Parameters

• **T** *extends* `"channelCreated"`

#### Parameters

• **event**: `T`

• **fn**

• **context?**: `any`

#### Returns

`this`

#### Defined in

[packages/tools-lukso-provider/src/server.ts:252](https://github.com/lukso-network/universalprofile-test-dapp/blob/76390a481233271abc57cda0cbb2b69afd9acb37/packages/tools-lukso-provider/src/server.ts#L252)

***

### once()

> **once**\<`T`\>(`event`, `fn`, `context`?): `this`

Add a one-time listener for a given event.

#### Type Parameters

• **T** *extends* `"channelCreated"`

#### Parameters

• **event**: `T`

• **fn**

• **context?**: `any`

#### Returns

`this`

#### Defined in

[packages/tools-lukso-provider/src/server.ts:258](https://github.com/lukso-network/universalprofile-test-dapp/blob/76390a481233271abc57cda0cbb2b69afd9acb37/packages/tools-lukso-provider/src/server.ts#L258)

***

### removeAllListeners()

> **removeAllListeners**(`event`?): `this`

Remove all listeners, or those of the specified event.

#### Parameters

• **event?**: `"channelCreated"`

#### Returns

`this`

#### Defined in

[packages/tools-lukso-provider/src/server.ts:269](https://github.com/lukso-network/universalprofile-test-dapp/blob/76390a481233271abc57cda0cbb2b69afd9acb37/packages/tools-lukso-provider/src/server.ts#L269)

***

### removeListener()

> **removeListener**\<`T`\>(`event`, `fn`?, `context`?, `once`?): `this`

Remove the listeners of a given event.

#### Type Parameters

• **T** *extends* `"channelCreated"`

#### Parameters

• **event**: `T`

• **fn?**

• **context?**: `any`

• **once?**: `boolean`

#### Returns

`this`

#### Defined in

[packages/tools-lukso-provider/src/server.ts:263](https://github.com/lukso-network/universalprofile-test-dapp/blob/76390a481233271abc57cda0cbb2b69afd9acb37/packages/tools-lukso-provider/src/server.ts#L263)

***

### setupProvider()

> **setupProvider**(`provider`, `rpcUrls`): `Promise`\<`void`\>

Connect this provider externally. This will be called during initial construction
but can be called at a later time if desired to re-initialize or tear down
the connection.

#### Parameters

• **provider**: [`UPProviderEndpoint`](UPProviderEndpoint.md)

• **rpcUrls**: `string` \| `string`[]

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/tools-lukso-provider/src/server.ts:305](https://github.com/lukso-network/universalprofile-test-dapp/blob/76390a481233271abc57cda0cbb2b69afd9acb37/packages/tools-lukso-provider/src/server.ts#L305)
