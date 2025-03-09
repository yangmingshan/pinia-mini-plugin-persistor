# pinia-mini-plugin-persistor

这是一个 `@vue-mini/pinia` 的持久化插件，可以自动的存储并恢复仓库状态。Fork 至 [pinia-plugin-persistedstate](https://github.com/prazdevs/pinia-plugin-persistedstate)

## 快速上手

1. 安装插件

```bash
npm install pinia-mini-plugin-persistor
```

2. 添加插件至 Pinia

```js
import { createPinia } from '@vue-mini/pinia'
import persistor from 'pinia-mini-plugin-persistor'

const pinia = createPinia()
pinia.use(persistor)
```

3. 给你想持久化的仓库添加 `persist` 选项

```js
import { ref } from '@vue-mini/core'
import { defineStore } from '@vue-mini/pinia'

const useStore = defineStore(
  'main',
  () => {
    const greeting = ref('Hello World')
    return { greeting }
  },
  { persist: true },
)
```

## 选项

### key

- 类型：`string`
- 默认值：`store.$id`

Storage 储存项的 key。

<details>
<summary>例子</summary>

```js
const useStore = defineStore(
  'main',
  () => {
    const count = ref(0)
    return { count }
  },
  { persist: { key: 'my-custom-key' } },
)
```

</details>

### state

- 类型：`(storeState: Readonly<StateTree>) => Partial<StateTree>`
- 默认值：`(storeState) => storeState`

用于筛选想要持久化的状态，默认全部。

<details>
<summary>例子</summary>

```js
const useStore = defineStore(
  'main',
  () => {
    const count = ref(0)
    const greeting = ref('Hello World')
    return { count， greeting }
  },
  {
    persist: {
      // 仅持久化 count
      state: (storeState) => ({count: storeState.count}),
    }
  },
)
```

</details>

## 高级用法

### 自定义插件

除了使用默认导出的插件外，你还可以使用 `createPersistor` 创建自定义插件以修改一些默认行为。

```js
import { createPersistor } from 'pinia-mini-plugin-persistor'

const persistor = createPersistor({
  // 将所有仓库的 persist 选项默认值设为 true
  auto: true,
  // 给所有 key 添加统一前缀（id 为 store.$id 或自定义 key）
  key: (id) => `__persisted__${id}`,
})

pinia.use(persistor)
```

### 手动水合

如果你需要手动触发水合，将 Storage 中存储的状态同步到仓库中，可以使用仓库的 `$hydrate` 方法。

```js
const store = useStore()

store.$hydrate()
```

### 手动持久化

如果你需要手动触发持久化，将仓库的状态存储到 Storage 中，可以使用仓库的 `$persist` 方法。

```js
const store = useStore()

store.$persist()
```

## 许可证

[MIT](https://opensource.org/licenses/MIT)

Copyright (c) 2025-present Yang Mingshan
