import type { Store, StateTree, PiniaPluginContext } from '@vue-mini/pinia'

export interface PluginOptions {
  /**
   * Global key generator, allow pre/postfixing store keys.
   */
  key?: (storeKey: string) => string

  /**
   * Automatically persist all stores with global defaults, opt-out individually.
   */
  auto?: boolean
}

export interface PersistorOptions {
  /**
   * Storage key to use.
   * @default $store.id
   */
  key?: string
}

declare module '@vue-mini/pinia' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export interface DefineStoreOptionsBase<S extends StateTree, Store> {
    persist?: boolean | PersistorOptions
  }

  export interface PiniaCustomProperties {
    $hydrate: () => void
    $persist: () => void
  }
}

function hydrate(key: string, store: Store) {
  try {
    const state: string = wx.getStorageSync(key)
    if (state) {
      store.$patch(JSON.parse(state))
    }
  } catch (error) {
    if (__DEV__) {
      console.error('[pinia-mini-plugin-persistor]', error)
    }
  }
}

function persist(key: string, state: StateTree) {
  try {
    wx.setStorageSync(key, JSON.stringify(state))
  } catch (error) {
    if (__DEV__) {
      console.error('[pinia-mini-plugin-persistor]', error)
    }
  }
}

export function createPersistor(pluginOptions: PluginOptions = {}) {
  if (pluginOptions.key === undefined) {
    pluginOptions.key = (x: string) => x
  }
  if (pluginOptions.auto === undefined) {
    pluginOptions.auto = false
  }

  const persistor = (context: PiniaPluginContext) => {
    const { store, options } = context
    if (options.persist === undefined) {
      options.persist = pluginOptions.auto
    }

    if (!options.persist) return

    const persistorOptions = options.persist === true ? {} : options.persist
    persistorOptions.key = pluginOptions.key!(persistorOptions.key || store.$id)

    store.$hydrate = () => {
      hydrate(persistorOptions.key!, store)
    }

    store.$persist = () => {
      persist(persistorOptions.key!, store.$state)
    }

    hydrate(persistorOptions.key, store)

    store.$subscribe(
      (_, state) => {
        persist(persistorOptions.key!, state)
      },
      { detached: true },
    )
  }

  return persistor
}

export default createPersistor()
