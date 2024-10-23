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

[packages/tools-lukso-provider/src/client.ts:245](https://github.com/lukso-network/universalprofile-test-dapp/blob/aca91b0b45c39879daeb5b9f9b46717028f73a74/packages/tools-lukso-provider/src/client.ts#L245)
