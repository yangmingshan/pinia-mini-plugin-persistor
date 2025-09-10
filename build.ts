import fs from 'node:fs/promises'
import path from 'node:path'
import { rollup } from 'rollup'
import terser from '@rollup/plugin-terser'
import replace from '@rollup/plugin-replace'
import typescript from '@rollup/plugin-typescript'

async function generateDeclaration() {
  const bundle = await rollup({
    input: path.join('src', 'index.ts'),
    external: ['@vue-mini/core', '@vue-mini/pinia'],
    plugins: [
      typescript({
        tsconfig: 'tsconfig.build.json',
        compilerOptions: { noCheck: true, declarationDir: 'dist' },
      }),
    ],
  })
  await bundle.write({ dir: 'dist', format: 'es' })
  await fs.rm(path.join('dist', 'index.js'))
}

async function generateCode({
  minify,
  replaces,
  fileName,
  format,
}: {
  minify: boolean
  replaces: Record<string, string>
  fileName: string
  format: 'es' | 'cjs'
}) {
  const bundle = await rollup({
    input: path.join('src', 'index.ts'),
    external: ['@vue-mini/core', '@vue-mini/pinia'],
    plugins: [
      minify && terser({ compress: { ecma: 2016, pure_getters: true } }),
      typescript({
        tsconfig: 'tsconfig.build.json',
        compilerOptions: {
          noCheck: true,
          declaration: false,
          isolatedDeclarations: false,
        },
      }),
      replace({ values: replaces, preventAssignment: true }),
    ].filter(Boolean),
  })
  await bundle.write({
    file: path.join('dist', fileName),
    exports: 'named',
    format,
  })
}

async function build() {
  await fs.rm('dist', { recursive: true, force: true })

  await generateDeclaration()

  await generateCode({
    minify: false,
    replaces: { __DEV__: 'true' },
    fileName: 'index.cjs.js',
    format: 'cjs',
  })

  await generateCode({
    minify: true,
    replaces: { __DEV__: 'false' },
    fileName: 'index.cjs.prod.js',
    format: 'cjs',
  })

  await generateCode({
    minify: false,
    replaces: { __DEV__: `(process.env.NODE_ENV !== 'production')` },
    fileName: 'index.esm-bundler.js',
    format: 'es',
  })
}

// @ts-expect-error: ...
await build()
