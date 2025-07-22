import globals from 'globals'
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

const config = [
  { ignores: ['dist/', 'coverage/'] },
  {
    files: ['**/*.js', '**/*.ts'],
    linterOptions: { reportUnusedDisableDirectives: true },
    rules: {
      ...eslint.configs.recommended.rules,
      // Avoid conflicts with Prettier
      // https://github.com/prettier/eslint-config-prettier#no-unexpected-multiline
      'no-unexpected-multiline': 'off',
    },
  },
  { files: ['**/*.js'], languageOptions: { globals: globals.node } },
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
  },
]

export default config
