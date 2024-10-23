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

[packages/tools-lukso-provider/src/server.ts:359](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/server.ts#L359)

***

### channels

> `get` **channels**(): `Map`\<`string`, [`UPClientChannel`](UPClientChannel.md)\>

Get a map of all clients by their ID.

#### Returns

`Map`\<`string`, [`UPClientChannel`](UPClientChannel.md)\>

#### Defined in

[packages/tools-lukso-provider/src/server.ts:364](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/server.ts#L364)

***

### provider

> `get` **provider**(): `any`

#### Returns

`any`

#### Defined in

[packages/tools-lukso-provider/src/server.ts:358](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/server.ts#L358)

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

[packages/tools-lukso-provider/src/server.ts:318](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/server.ts#L318)

***

### close()

> **close**(): `void`

#### Returns

`void`

#### Defined in

[packages/tools-lukso-provider/src/server.ts:356](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/server.ts#L356)

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

[packages/tools-lukso-provider/src/server.ts:305](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/server.ts#L305)

***

### eventNames()

> **eventNames**(): `"channelCreated"`[]

Return an array listing the events for which the emitter has registered
listeners.

#### Returns

`"channelCreated"`[]

#### Defined in

[packages/tools-lukso-provider/src/server.ts:286](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/server.ts#L286)

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

[packages/tools-lukso-provider/src/server.ts:371](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/server.ts#L371)

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

[packages/tools-lukso-provider/src/server.ts:383](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/server.ts#L383)

***

### listenerCount()

> **listenerCount**(`event`): `number`

Return the number of listeners listening to a given event.

#### Parameters

• **event**: `"channelCreated"`

#### Returns

`number`

#### Defined in

[packages/tools-lukso-provider/src/server.ts:298](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/server.ts#L298)

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

[packages/tools-lukso-provider/src/server.ts:291](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/server.ts#L291)

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

[packages/tools-lukso-provider/src/server.ts:342](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/server.ts#L342)

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

[packages/tools-lukso-provider/src/server.ts:313](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/server.ts#L313)

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

[packages/tools-lukso-provider/src/server.ts:327](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/server.ts#L327)

***

### removeAllListeners()

> **removeAllListeners**(`event`?): `this`

Remove all listeners, or those of the specified event.

#### Parameters

• **event?**: `"channelCreated"`

#### Returns

`this`

#### Defined in

[packages/tools-lukso-provider/src/server.ts:352](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/server.ts#L352)

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

[packages/tools-lukso-provider/src/server.ts:336](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/server.ts#L336)

***

### setupProvider()

> **setupProvider**(`provider`, `rpcUrls`): `Promise`\<`void`\>

Connect this provider externally. This will be called during initial construction
but can be called at a later time if desired to re-initialize or tear down
the connection.

#### Parameters

• **provider**: `any`

• **rpcUrls**: `string` \| `string`[]

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/tools-lukso-provider/src/server.ts:392](https://github.com/lukso-network/universalprofile-test-dapp/blob/f28ff9e0e073bc0e12dc398bea7a2ae17e2fb2f3/packages/tools-lukso-provider/src/server.ts#L392)
