import type { StateTree } from '@vue-mini/pinia'

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
