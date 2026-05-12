export const RpcSchema = {
  wallet_connect: {
    Capabilities: {},
  },
}

export const Porto = {
  create: () => {
    throw new Error('The optional Porto connector is not configured.')
  },
}
