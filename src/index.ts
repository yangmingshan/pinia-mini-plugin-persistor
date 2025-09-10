import type { UnwrapRef } from '@vue-mini/core'
import { readonly } from '@vue-mini/core'
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

export interface PersistorOptions<S> {
  /**
   * Storage key to use.
   * @default $store.id
   */
  key?: string

  state?: (storeState: Readonly<S>) => Partial<S>
}

declare module '@vue-mini/pinia' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export interface DefineStoreOptionsBase<S, Store> {
    persist?: boolean | PersistorOptions<UnwrapRef<S>>
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

function persist(options: PersistorOptions<StateTree>, state: StateTree) {
  try {
    wx.setStorageSync(
      options.key!,
      JSON.stringify(options.state!(readonly(state))),
    )
  } catch (error) {
    if (__DEV__) {
      console.error('[pinia-mini-plugin-persistor]', error)
    }
  }
}

export function createPersistor(
  pluginOptions: PluginOptions = {},
): (context: PiniaPluginContext) => void {
  if (pluginOptions.key === undefined) {
    pluginOptions.key = (k) => k
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
    if (persistorOptions.state === undefined) {
      persistorOptions.state = (s) => s
    }

    store.$hydrate = () => {
      hydrate(persistorOptions.key!, store)
    }

    store.$persist = () => {
      persist(persistorOptions, store.$state)
    }

    hydrate(persistorOptions.key, store)

    store.$subscribe(
      (_, state) => {
        persist(persistorOptions, state)
      },
      { detached: true },
    )
  }

  return persistor
}

const persistor: (context: PiniaPluginContext) => void = createPersistor()

export default persistor
