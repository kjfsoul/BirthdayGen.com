import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  // Extend Next.js configs
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Global ignores
  {
    ignores: [
      // Build outputs
      '.next/**',
      'out/**',
      'build/**',
      'dist/**',

      // Dependencies
      'node_modules/**',

      // Config files
      '*.config.ts',
      '*.config.js',
      '*.config.mjs',
      '*.config.cjs',
      'jest.config.ts',
      'next-env.d.ts',

      // Non-source directories
      'scripts/**',
      'docs/**',
      'logs/**',
      '.agent/**',
      '.cursor/**',
      '.beads/**',
      '.git/**',
      '.vercel/**',
      '.roo/**',
      '.kilocode/**',
      '.clinerules/**',
      'memory/**',
      'prisma/**',
      'supabase/**',
      'public/**',
      'pages/**',
      'examples/**',
      'jules-scratch/**',
      'prompts/**',

      // Generated files
      '*.tsbuildinfo',
      'global.d.ts',

      // Lock files and logs
      '*.log',
      'pnpm-lock.yaml',
      'package-lock.json',
      'yarn.lock',

      // Markdown and docs
      '*.md',
      '*.pdf',
      '*.html',

      // Server and configs
      'server.ts',
      'tailwind.config.ts',
      'postcss.config.mjs',
      'components.json',
    ],
  },

  // Rules for source files
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      // TypeScript - relaxed for daily work
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',

      // React Hooks - warn instead of error
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/rules-of-hooks': 'error',

      // React - practical for daily work
      'react/no-unescaped-entities': 'warn',
      'react/display-name': 'off',
      'react/prop-types': 'off',

      // Next.js - warn for best practices
      '@next/next/no-img-element': 'warn',
      '@next/next/no-html-link-for-pages': 'warn',

      // General JavaScript - keep code quality
      'prefer-const': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'warn',
      'no-unused-vars': 'off', // Use TypeScript version instead
    },
  },
];

export default eslintConfig;
