// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactNativePlugin from 'eslint-plugin-react-native';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.expo/**',
      '**/.next/**',
      '**/out/**',
      '**/build/**',
      '**/packages/shared/dist/**',
      '**/eslint.config.mjs',
      '**/.vercel/**',
      '**/.agents/**',
      '**/.playwright-cli/**',
      '**/.claude/**',
      '**/.specify/**',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'react-native': reactNativePlugin,
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.serviceworker,
        ...globals.es2021,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // General TypeScript Rules
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',

      // Prettier Integration
      'prettier/prettier': ['error', { endOfLine: 'auto' }],

      // Import Auto-Sorting Rules
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      // Unused Imports Rules
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      // React & Hooks Rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    files: [
      '**/*.config.{js,ts,mjs}',
      '**/babel.config.js',
      '**/metro.config.js',
      '**/tailwind.config.js',
    ],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
);
