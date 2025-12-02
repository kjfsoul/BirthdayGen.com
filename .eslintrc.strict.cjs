/** @type {import('eslint').Linter.Config} */
module.exports = {
    extends: [
        'next/core-web-vitals',
        'next/typescript',
    ],

    // Only lint source files
    ignorePatterns: [
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
        'memory/**',
        'prisma/**',
        'supabase/**',
        'public/**',

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
    ],

    rules: {
        // TypeScript - strict enforcement
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-unused-vars': ['error', {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
        }],
        '@typescript-eslint/no-non-null-assertion': 'error',
        '@typescript-eslint/ban-ts-comment': 'error',
        '@typescript-eslint/prefer-as-const': 'error',

        // React Hooks - strict enforcement
        'react-hooks/exhaustive-deps': 'error',
        'react-hooks/rules-of-hooks': 'error',

        // React - best practices enforced
        'react/no-unescaped-entities': 'error',
        'react/jsx-key': 'error',
        'react/jsx-no-target-blank': 'error',

        // Next.js - strict best practices
        '@next/next/no-img-element': 'error',
        '@next/next/no-html-link-for-pages': 'error',
        '@next/next/no-sync-scripts': 'error',

        // General JavaScript - production quality
        'prefer-const': 'error',
        'no-console': ['error', { allow: ['warn', 'error'] }],
        'no-debugger': 'error',
        'no-unused-vars': 'off', // Use TypeScript version instead
        'no-var': 'error',
        'eqeqeq': ['error', 'always'],
    },
};
