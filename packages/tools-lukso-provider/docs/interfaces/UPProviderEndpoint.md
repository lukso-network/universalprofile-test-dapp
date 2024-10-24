[**@lukso/embedded-provider**](../README.md) • **Docs**

***

[@lukso/embedded-provider](../globals.md) / UPProviderEndpoint

# Interface: UPProviderEndpoint

## Methods

### on()

> **on**\<`T`\>(`event`, `fn`, `context`?): `this`

#### Type Parameters

• **T** *extends* keyof [`UPProviderEndpointEvents`](UPProviderEndpointEvents.md)

#### Parameters

• **event**: `T`

• **fn**

• **context?**: `any`

#### Returns

`this`

#### Defined in

[packages/tools-lukso-provider/src/server.ts:205](https://github.com/lukso-network/universalprofile-test-dapp/blob/76390a481233271abc57cda0cbb2b69afd9acb37/packages/tools-lukso-provider/src/server.ts#L205)

***

### request()

#### request(message, clientParams)

> **request**(`message`, `clientParams`?): `Promise`\<`any`\>

##### Parameters

• **message**

• **message.method**: `string`

• **message.params?**: `any`

• **clientParams?**: `any`

##### Returns

`Promise`\<`any`\>

##### Defined in

[packages/tools-lukso-provider/src/server.ts:206](https://github.com/lukso-network/universalprofile-test-dapp/blob/76390a481233271abc57cda0cbb2b69afd9acb37/packages/tools-lukso-provider/src/server.ts#L206)

#### request(method, params, clientParams)

> **request**(`method`, `params`?, `clientParams`?): `Promise`\<`any`\>

##### Parameters

• **method**: `string` \| `object`

• **params?**: `any`

• **clientParams?**: `any`

##### Returns

`Promise`\<`any`\>

##### Defined in

[packages/tools-lukso-provider/src/server.ts:207](https://github.com/lukso-network/universalprofile-test-dapp/blob/76390a481233271abc57cda0cbb2b69afd9acb37/packages/tools-lukso-provider/src/server.ts#L207)
