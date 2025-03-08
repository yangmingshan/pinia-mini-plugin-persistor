import fs from 'node:fs/promises'
import path from 'node:path'
import { rollup } from 'rollup'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'

async function generateDeclaration() {
  const bundle = await rollup({
    input: path.join('src', 'index.ts'),
    external: ['@vue-mini/pinia'],
    plugins: [
      typescript({
        tsconfig: 'tsconfig.build.json',
        compilerOptions: { declaration: true, declarationDir: 'dist' },
      }),
    ],
  })
  await bundle.write({ dir: 'dist', format: 'es' })
  await fs.rm(path.join('dist', 'index.js'))
}

async function generateCode({
  minify,
  fileName,
  format,
}: {
  minify: boolean
  fileName: string
  format: 'es' | 'cjs'
}) {
  const bundle = await rollup({
    input: path.join('src', 'index.ts'),
    external: ['@vue-mini/pinia'],
    plugins: [
      minify && terser({ compress: { ecma: 2016, pure_getters: true } }),
      typescript({ tsconfig: 'tsconfig.build.json' }),
    ].filter(Boolean),
  })
  await bundle.write({ file: path.join('dist', fileName), format })
}

async function build() {
  await fs.rm('dist', { recursive: true, force: true })

  await generateDeclaration()

  await generateCode({ minify: false, fileName: 'index.cjs.js', format: 'cjs' })

  await generateCode({
    minify: true,
    fileName: 'index.cjs.prod.js',
    format: 'cjs',
  })

  await generateCode({
    minify: false,
    fileName: 'index.esm-bundler.js',
    format: 'es',
  })
}

// @ts-expect-error: ...
await build()
