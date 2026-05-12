import { ref, type Ref } from 'vue'
import { createClientUPProvider } from '@lukso/up-provider'

type AnyProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
  on?: (event: string, handler: (...args: any[]) => void) => unknown
  removeListener?: (event: string, handler: (...args: any[]) => void) => unknown
}

let cached: AnyProvider | undefined

const chainId: Ref<number | null> = ref(null)
const accounts: Ref<string[]> = ref([])
const contextAccounts: Ref<string[]> = ref([])
const isMiniApp: Ref<boolean> = ref(
  typeof window !== 'undefined' && window.parent !== window
)

const safeRequest = async <T>(
  provider: AnyProvider,
  method: string,
  params: unknown[] = []
): Promise<T | undefined> => {
  try {
    return (await provider.request({ method, params })) as T
  } catch {
    return undefined
  }
}

const initState = async (provider: AnyProvider) => {
  const [_chainId, _accounts, _contextAccounts] = await Promise.all([
    safeRequest<string | number>(provider, 'eth_chainId'),
    safeRequest<string[]>(provider, 'eth_accounts'),
    safeRequest<string[]>(provider, 'up_contextAccounts'),
  ])
  if (_chainId !== undefined && _chainId !== null) {
    chainId.value =
      typeof _chainId === 'string' ? parseInt(_chainId, 16) : Number(_chainId)
  }
  if (Array.isArray(_accounts)) {
    accounts.value = _accounts
  }
  if (Array.isArray(_contextAccounts)) {
    contextAccounts.value = _contextAccounts
  }
}

const attachListeners = (provider: AnyProvider) => {
  if (!provider.on) return
  provider.on('accountsChanged', (next: string[]) => {
    accounts.value = Array.isArray(next) ? next : []
  })
  provider.on('contextAccountsChanged', (next: string[]) => {
    contextAccounts.value = Array.isArray(next) ? next : []
  })
  provider.on('chainChanged', (next: number | string) => {
    chainId.value = typeof next === 'string' ? parseInt(next, 16) : Number(next)
  })
  provider.on('connect', (info?: { chainId?: string | number }) => {
    if (info?.chainId !== undefined) {
      chainId.value =
        typeof info.chainId === 'string'
          ? parseInt(info.chainId, 16)
          : Number(info.chainId)
    }
  })
  provider.on('disconnect', () => {
    accounts.value = []
  })
}

export const getUpProvider = (): AnyProvider => {
  if (cached) return cached
  if (typeof window === 'undefined') {
    return {
      request: async () => undefined,
    } as AnyProvider
  }
  const existing = window.lukso as AnyProvider | undefined
  if (existing && typeof existing.request === 'function') {
    cached = existing
  } else {
    const created = createClientUPProvider() as unknown as AnyProvider
    cached = created
    window.lukso = created as unknown as typeof window.lukso
  }
  initState(cached)
  attachListeners(cached)
  return cached
}

export default function useUpProvider() {
  const provider = getUpProvider()
  return {
    provider,
    chainId,
    accounts,
    contextAccounts,
    isMiniApp,
  }
}
