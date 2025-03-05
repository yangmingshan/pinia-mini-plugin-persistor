import globals from 'globals'
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

const config = [
  {
    files: ['**/*.js', '**/*.ts'],
    ignores: ['dist/**/*', 'coverage/**/*'],
    linterOptions: { reportUnusedDisableDirectives: true },
    ...eslint.configs.recommended,
  },
  {
    files: ['**/*.js'],
    languageOptions: { globals: globals.node },
    ...prettier,
  },
  ...tseslint.configs.recommendedTypeChecked.map((c) => ({
    ...c,
    files: ['**/*.ts'],
  })),
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    ...prettier,
  },
]

export default config
