# ESLint Configuration Strategy

**Last Updated:** 2025-11-24
**Purpose:** Dual ESLint configuration for practical development and deployment checks

---

## Overview

The project uses a **dual ESLint configuration strategy** to balance daily development productivity with deployment quality standards.

---

## Configuration Files

### 1. `.eslintrc.json` (Default - Practical)

**Purpose:** Daily development with manageable warnings
**Rule Level:** Warning-based for most issues
**Used by:** `pnpm lint`, `pnpm lint:fix`

**Key Features:**
- Warnings instead of errors for TypeScript `any` types
- Warns on unused variables (allows `_` prefix)
- Warns on console statements (allows `console.warn/error`)
- Warns on React Hooks dependency arrays
- Comprehensive ignore patterns for non-source files

### 2. `.eslintrc.strict.json` (Strict - Deployment)

**Purpose:** Pre-deployment quality checks (Vercel compliance)
**Rule Level:** Error-based enforcement
**Used by:** `pnpm lint:strict`

**Key Features:**
- Errors on TypeScript `any` types
- Errors on unused variables
- Errors on console statements (except `warn/error`)
- Errors on React Hooks violations
- Enforces `eqeqeq`, `no-var`, and best practices

---

## Ignore Patterns

Both configs ignore:

### Build Outputs
- `.next/`, `out/`, `build/`, `dist/`

### Dependencies
- `node_modules/`

### Config Files
- `*.config.ts`, `*.config.js`, `*.config.mjs`, `*.config.cjs`
- `jest.config.ts`, `next-env.d.ts`
- `tailwind.config.ts`, `postcss.config.mjs`
- `components.json`

### Non-Source Directories
- `scripts/`, `docs/`, `logs/`
- `.agent/`, `.cursor/`, `.beads/`
- `.git/`, `.vercel/`, `.roo/`, `.kilocode/`
- `memory/`, `prisma/`, `supabase/`
- `public/`, `pages/`, `examples/`

### Generated Files
- `*.tsbuildinfo`, `global.d.ts`
- `*.log`, lock files

### Documentation
- `*.md`, `*.pdf`, `*.html`

### Server
- `server.ts` (custom Express server)

---

## Commands

### `pnpm lint`
**Default lint check - practical for daily work**

```bash
pnpm lint
```

- Uses `.eslintrc.json` (warning-level rules)
- Scoped to `src/` directory only
- Reports ~195 warnings (manageable)
- Does not block development

**When to use:**
- During daily development
- Before committing code
- For incremental fixes

---

### `pnpm lint:strict`
**Strict lint check - for deployment validation**

```bash
pnpm lint:strict
```

- Uses `.eslintrc.strict.json` (error-level rules)
- Scoped to `src/` directory only
- Zero warnings tolerance (`--max-warnings 0`)
- Enforces production-quality code

**When to use:**
- Before deploying to production
- Pre-merge code quality checks
- CI/CD pipeline validation
- Vercel deployment checks

**Implementation:**
- Runs via `scripts/lint-strict.sh`
- Temporarily swaps config files
- Restores original config after run

---

### `pnpm lint:fix`
**Auto-fix linting issues**

```bash
pnpm lint:fix
```

- Uses `.eslintrc.json` (default config)
- Auto-fixes formatting and simple issues
- Safe for daily use
- Does not fix logic issues

**When to use:**
- Quick cleanup of formatting
- Auto-fix unused imports
- Standardize code style

---

## Migration from Previous Setup

### What Changed

**Before:**
- Default lint used Vercel strict config
- Linted entire codebase (`.`)
- Included non-source files (scripts, configs, logs)
- All issues were blocking errors

**After:**
- Separated default (practical) and strict (deployment) configs
- Scoped to `src/**/*.{ts,tsx}` only
- Enhanced ignore patterns
- Warnings for daily work, errors for deployment

---

## Current Lint Status

### Default Lint (`pnpm lint`)
**Status:** ✅ **195 warnings** (manageable)

**Top Issues:**
- TypeScript `any` types: ~120 warnings
- Unused variables: ~40 warnings
- Console statements: ~25 warnings
- React Hooks: ~10 warnings

**Action:** Fix incrementally or use `pnpm lint:fix` for auto-fixable issues

### Strict Lint (`pnpm lint:strict`)
**Status:** ⚠️ **Same issues as errors** (blocks deployment)

**Required before production:**
- Fix all `any` types with proper typing
- Remove unused variables or prefix with `_`
- Replace console statements with proper logging
- Fix React Hooks dependency arrays

---

## Incremental Fix Strategy

### Priority 1: Auto-fixable Issues
```bash
pnpm lint:fix
```

### Priority 2: Console Statements
- Replace `console.log` with proper logger
- Keep `console.warn` and `console.error` for critical issues
- Remove debug statements

### Priority 3: Unused Variables
- Prefix with `_` if intentionally unused
- Remove if truly not needed
- Refactor to use properly

### Priority 4: TypeScript `any`
- Add proper type definitions
- Use `unknown` for truly dynamic types
- Create type guards for runtime checks

### Priority 5: React Hooks
- Review dependency arrays
- Add missing dependencies
- Use `useCallback`/`useMemo` properly

---

## Integration with Build Process

### Development Build
```bash
pnpm dev
# Lint issues are warnings only
```

### Production Build
```bash
pnpm lint:strict  # ⚠️ Must pass before deployment
pnpm build
```

### CI/CD Pipeline
```bash
# Recommended workflow
pnpm lint        # Show all issues
pnpm typecheck   # Check types
pnpm lint:strict # Block if fails
pnpm build       # Deploy-ready build
```

---

## ESLint Version

**Current:** ESLint 8.57.1 (deprecated but required)

**Why ESLint 8?**
- Next.js 14.2.15 is not fully compatible with ESLint 9
- ESLint 9 requires flat config format
- `eslint-plugin-react-hooks` incompatibility with ESLint 9

**Future:** Upgrade to ESLint 9 when Next.js 15+ is stable

---

## Configuration Details

### Default Rules (Warning Level)

```json
{
  "@typescript-eslint/no-explicit-any": "warn",
  "@typescript-eslint/no-unused-vars": ["warn", {
    "argsIgnorePattern": "^_",
    "varsIgnorePattern": "^_"
  }],
  "react-hooks/exhaustive-deps": "warn",
  "no-console": ["warn", { "allow": ["warn", "error"] }],
  "prefer-const": "warn"
}
```

### Strict Rules (Error Level)

```json
{
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/no-unused-vars": ["error", {
    "argsIgnorePattern": "^_",
    "varsIgnorePattern": "^_"
  }],
  "react-hooks/exhaustive-deps": "error",
  "no-console": ["error", { "allow": ["warn", "error"] }],
  "prefer-const": "error",
  "eqeqeq": ["error", "always"],
  "no-var": "error"
}
```

---

## Troubleshooting

### "Cannot find module '.eslintrc.json'"
**Solution:** Ensure `.eslintrc.json` exists in project root

### "All files are ignored"
**Solution:** Check `ignorePatterns` in config, ensure you're linting `src/`

### "react-hooks/rules-of-hooks error"
**Solution:** Use ESLint 8.x (not ESLint 9.x) with Next.js 14

### Strict lint not using strict config
**Solution:** Run `bash scripts/lint-strict.sh` directly or via `pnpm lint:strict`

---

## Best Practices

1. **Daily Development:**
   - Run `pnpm lint` to see current issues
   - Use `pnpm lint:fix` for quick fixes
   - Fix critical errors immediately

2. **Before Committing:**
   - Run `pnpm lint` and address new warnings
   - Don't introduce new lint issues

3. **Before Deploying:**
   - Run `pnpm lint:strict` to catch deployment blockers
   - Fix all errors before production deployment
   - Verify with `pnpm build`

4. **Code Reviews:**
   - Check lint status in PR
   - Require passing `pnpm lint:strict` for production merges
   - Allow warnings for feature branches

---

## Summary

✅ **Default lint** (195 warnings) - manageable for daily work
⚠️ **Strict lint** - required before deployment
🔧 **Auto-fix** - quick cleanup tool
📁 **Scoped to `src/`** - ignores scripts, configs, docs
🎯 **Two configs** - practical vs. production-ready

**Next Steps:**
1. Continue development with default lint
2. Fix issues incrementally with `pnpm lint:fix`
3. Run `pnpm lint:strict` before production deployments

---

**Document Created:** 2025-11-24
**Beads Issue:** BirthdayGen.com-x3wl
**Related:** Build Stability Protocol (MEMORY_PROCEDURES.md Section 13)
