[**@lukso/embedded-provider**](../README.md) • **Docs**

***

[@lukso/embedded-provider](../globals.md) / createClientUPProvider

# Function: createClientUPProvider()

> **createClientUPProvider**(`authURL`?, `search`?): [`UPClientProvider`](../interfaces/UPClientProvider.md)

Create clientUPProvider. This can be used like a normal window.ethereum or window.lukso provider.
It will on initialization look for a connection to a global provider.

## Parameters

• **authURL?**: `string` \| `Window`

Optionally put a URL to a authentication provider to provide the global provider.

• **search?**: `boolean` = `true`

If false then don't search but take the passed in value as is.

## Returns

[`UPClientProvider`](../interfaces/UPClientProvider.md)

the client UPProvider

## Defined in

[packages/tools-lukso-provider/src/client.ts:254](https://github.com/lukso-network/universalprofile-test-dapp/blob/76390a481233271abc57cda0cbb2b69afd9acb37/packages/tools-lukso-provider/src/client.ts#L254)
