import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default tseslint.config(
  { ignores: ['dist/**'] },

  js.configs.recommended,
  tseslint.configs.recommended,

  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // React hooks
      ...reactHooks.configs['recommended-latest'].rules,

      // HMR safety (warn on non-component exports from component files)
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // TypeScript quality
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // Allow empty catch blocks (intentional in audio/localStorage try-catches)
      'no-empty': ['error', { allowEmptyCatch: true }],

      // Allow common patterns in game code
      'no-constant-condition': 'off',

      // New react-hooks v7 strict rules — downgrade to warn for game-engine patterns
      // (canvas rAF loop, momentIndex-driven state reset, Discord vote init are all valid)
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
    },
  },
)
