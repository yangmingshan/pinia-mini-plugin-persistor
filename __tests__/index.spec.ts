import { describe, beforeEach, afterEach, test, expect, vi } from 'vitest'
import { ref, nextTick } from '@vue-mini/core'
import type { Pinia } from '@vue-mini/pinia'
import { createPinia, disposePinia, defineStore } from '@vue-mini/pinia'
import persistor, { createPersistor } from '../src'

const storage = new Map<string, string>()
// @ts-expect-error: ...
globalThis.wx = {
  getStorageSync(key: string) {
    return storage.get(key)
  },
  setStorageSync(key: string, value: string) {
    storage.set(key, value)
  },
}

describe('persistor', () => {
  let pinia: Pinia

  beforeEach(() => {
    pinia = createPinia()
  })

  afterEach(() => {
    storage.clear()
    disposePinia(pinia)
  })

  test('should persist the store', async () => {
    pinia.use(persistor)
    const store = defineStore(
      'main',
      () => {
        const count = ref(0)
        const increment = () => {
          count.value++
        }
        return { count, increment }
      },
      { persist: true },
    )()
    store.increment()
    await nextTick()
    expect(storage.get('main')).toBe('{"count":1}')
  })

  test('should hydrate the store', () => {
    pinia.use(persistor)
    storage.set('main', '{"count":1}')
    const store = defineStore(
      'main',
      () => {
        const count = ref(0)
        return { count }
      },
      { persist: true },
    )()
    expect(store.count).toBe(1)
  })

  test('$persist()', () => {
    pinia.use(persistor)
    const store = defineStore(
      'main',
      () => {
        const count = ref(0)
        return { count }
      },
      { persist: true },
    )()
    store.$persist()
    expect(storage.get('main')).toBe('{"count":0}')
  })

  test('$hydrate()', () => {
    pinia.use(persistor)
    const store = defineStore(
      'main',
      () => {
        const count = ref(0)
        return { count }
      },
      { persist: true },
    )()
    storage.set('main', '{"count":1}')
    store.$hydrate()
    expect(store.count).toBe(1)
  })

  test('custom key', () => {
    pinia.use(persistor)
    const store = defineStore(
      'main',
      () => {
        const count = ref(0)
        return { count }
      },
      { persist: { key: 'custom_key' } },
    )()
    store.$persist()
    expect(storage.get('custom_key')).toBe('{"count":0}')
  })

  test('state filter', () => {
    pinia.use(persistor)
    const store = defineStore(
      'main',
      () => {
        const count = ref(0)
        const greeting = ref('Hello')
        return { count, greeting }
      },
      { persist: { state: (s) => ({ greeting: s.greeting }) } },
    )()
    store.$persist()
    expect(storage.get('main')).toBe('{"greeting":"Hello"}')
  })

  test('custom key function', () => {
    pinia.use(createPersistor({ key: (k) => `custom_${k}` }))
    const store = defineStore(
      'main',
      () => {
        const count = ref(0)
        return { count }
      },
      { persist: true },
    )()
    store.$persist()
    expect(storage.get('custom_main')).toBe('{"count":0}')
  })

  test('auto option', async () => {
    pinia.use(createPersistor({ auto: true }))

    const store1 = defineStore('main', () => {
      const count = ref(0)
      const increment = () => {
        count.value++
      }
      return { count, increment }
    })()
    store1.increment()
    await nextTick()
    expect(storage.get('main')).toBe('{"count":1}')

    const stor2 = defineStore(
      'opt-out',
      () => {
        const count = ref(0)
        const increment = () => {
          count.value++
        }
        return { count, increment }
      },
      { persist: false },
    )()
    stor2.increment()
    await nextTick()
    expect(storage.get('opt-out')).toBe(undefined)
  })

  test('persist error log', () => {
    const spy = vi.spyOn(console, 'error')
    spy.mockImplementation(() => {})
    wx.setStorageSync = () => {
      throw new Error('Test')
    }

    pinia.use(persistor)
    const store = defineStore(
      'main',
      () => {
        const count = ref(0)
        return { count }
      },
      { persist: true },
    )()
    store.$persist()
    expect(spy).toHaveBeenCalledTimes(1)

    spy.mockRestore()
  })

  test('hydrate error log', () => {
    const spy = vi.spyOn(console, 'error')
    spy.mockImplementation(() => {})
    wx.getStorageSync = () => {
      throw new Error('Test')
    }

    pinia.use(persistor)
    defineStore(
      'main',
      () => {
        const count = ref(0)
        return { count }
      },
      { persist: true },
    )()
    expect(spy).toHaveBeenCalledTimes(1)

    spy.mockRestore()
  })
})
