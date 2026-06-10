import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // Downgraded to warn — codebase has widespread intentional `any` usage in Prisma
      // query builders. Clean up incrementally rather than blocking all commits.
      '@typescript-eslint/no-explicit-any': 'warn',
      // Allow _-prefixed vars as intentional discard (e.g. const { secret: _, ...rest } = obj)
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      // Pre-existing pattern throughout — suppress until async effects are refactored
      'react-hooks/set-state-in-effect': 'warn',
      // Legitimate "capture latest value" ref pattern — not a render-blocking issue
      'react-hooks/refs': 'warn',
      // Flag functions exceeding cyclomatic complexity 10
      complexity: ['warn', 10],
    },
  },
])
