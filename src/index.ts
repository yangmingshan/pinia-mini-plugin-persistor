import type { Store, StateTree, PiniaPluginContext } from '@vue-mini/pinia'

declare module '@vue-mini/pinia' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export interface DefineStoreOptionsBase<S extends StateTree, Store> {
    persist?: boolean
  }

  export interface PiniaCustomProperties {
    $hydrate: () => void
    $persist: () => void
  }
}

function hydrate(store: Store) {
  try {
    const state: string = wx.getStorageSync(store.$id)
    if (state) {
      store.$patch(JSON.parse(state))
    }
    // eslint-disable-next-line no-empty
  } catch {}
}

function persist(id: string, state: StateTree) {
  try {
    wx.setStorageSync(id, JSON.stringify(state))
    // eslint-disable-next-line no-empty
  } catch {}
}

export default function persistor(context: PiniaPluginContext) {
  const { store, options } = context

  if (!options.persist) return

  store.$hydrate = () => {
    hydrate(store)
  }

  store.$persist = () => {
    persist(store.$id, store.$state)
  }

  hydrate(store)

  store.$subscribe(
    (mutation, state) => {
      persist(mutation.storeId, state)
    },
    { detached: true },
  )
}
