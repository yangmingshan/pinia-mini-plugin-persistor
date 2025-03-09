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

  /**
   * Hook called before hydrating store.
   */
  beforeHydrate?: (context: PiniaPluginContext) => void

  /**
   * Hook called after hydrating store.
   */
  afterHydrate?: (context: PiniaPluginContext) => void
}

declare module '@vue-mini/pinia' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export interface DefineStoreOptionsBase<S extends StateTree, Store> {
    persist?: boolean | PersistorOptions
  }

  export interface PiniaCustomProperties {
    $hydrate: (options?: { runHooks?: boolean }) => void
    $persist: () => void
  }
}

function hydrate(
  store: Store,
  options: PersistorOptions,
  context: PiniaPluginContext,
  runHooks: boolean,
) {
  try {
    if (runHooks && options.beforeHydrate) {
      options.beforeHydrate(context)
    }

    const state: string = wx.getStorageSync(options.key!)
    if (state) {
      store.$patch(JSON.parse(state))
    }

    if (runHooks && options.afterHydrate) {
      options.afterHydrate(context)
    }
  } catch (error) {
    if (__DEV__) {
      console.error('[pinia-mini-plugin-persistor]', error)
    }
  }
}

function persist(id: string, state: StateTree) {
  try {
    wx.setStorageSync(id, JSON.stringify(state))
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

    store.$hydrate = ({ runHooks = true } = {}) => {
      hydrate(store, persistorOptions, context, runHooks)
    }

    store.$persist = () => {
      persist(persistorOptions.key!, store.$state)
    }

    hydrate(store, persistorOptions, context, true)

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
