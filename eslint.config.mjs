import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.webextensions,
        // Firefox/Chrome extension APIs
        browser: 'readonly',
        chrome: 'readonly',
        // Browser APIs
        window: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        // Additional globals that might be needed
        webextension: 'readonly'
      }
    },
    rules: {
      // TypeScript rules (without type-checking)
      '@typescript-eslint/no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-inferrable-types': 'warn',
      
      // JavaScript rules
      'no-undef': 'error',
      'no-unused-vars': 'off', // Turn off base rule as it's handled by TypeScript rule
      'prefer-const': 'warn',
      'no-console': 'off', // Allow console for debugging in extensions
      'no-var': 'error',
      'prefer-arrow-callback': 'warn',
      
      // Extension-specific
      'no-global-assign': 'error',
      'no-implicit-globals': 'error'
    }
  },
  {
    files: ['src/background.ts'],
    languageOptions: {
      globals: {
        // Background script specific globals
        importScripts: 'readonly'
      }
    }
  },
  {
    files: ['src/content.ts'],
    languageOptions: {
      globals: {
        // Content script has access to page globals
        ...globals.browser
      }
    }
  },
  {
    ignores: [
      'dist/',
      'node_modules/',
      'web-ext-artifacts/',
      '**/*.d.ts'
    ]
  }
];
