# DL_1_jest_config — Design

## Files to create/modify

| File | Action | Purpose |
|------|--------|---------|
| `jest.config.ts` | **CREATE** | Jest configuration: `ts-jest` preset, `jsdom` environment, `moduleNameMapper` for `@/` alias, test match patterns |
| `src/shared/utils/currenty-format/currency-format.util.test.ts` | **CREATE** | Unit tests for `currencyFormat()` covering R5 |
| `src/shared/utils/generate-pagination-numbers/generate-pagination-numbers.util.test.ts` | **CREATE** | Unit tests for `generatePaginationNumbers()` covering R6.1–R6.4 |
| `package.json` | **MODIFY** | Add devDependencies (jest, ts-jest, @types/jest, jest-environment-jsdom) and `"test": "jest"` script (R1, R2) |
| `tsconfig.json` | **MODIFY** *(if needed)* | Add `@types/jest` to `types` array to avoid TS errors in test files |

## New signatures (test files)

```
currency-format.util.test.ts
  describe('currencyFormat')
    it('formats a whole number as USD')
    it('formats a decimal number with two fraction digits')
    it('formats zero')

generate-pagination-numbers.util.test.ts
  describe('generatePaginationNumbers')
    it('returns all pages when totalPages <= maxItems')
    it('returns truncated start when currentPage <= 3')
    it('returns truncated end when currentPage >= totalPages - 2')
    it('returns middle window with ellipsis on both sides')
```

## Jest configuration details

- **preset**: `ts-jest/presets/default`
- **testEnvironment**: `jsdom` (future-proof for React component tests)
- **moduleNameMapper**: `{ '^@/(.+)$': '<rootDir>/$1' }` (maps `@/` path alias, R8)
- **testMatch**: `['**/*.test.{ts,tsx}']`
- No Babel needed — `ts-jest` handles TypeScript directly.
- `jest.config.ts` must be a CommonJS-compatible file or use `export default` with `ts-jest`'s support for ESM.

## Alternative considered

- **Vitest**: Faster and more modern, but the acceptance criteria explicitly ask for Jest. Jest is also the most widely adopted choice for Next.js projects, and `ts-jest` provides straightforward TypeScript support without additional build steps.
- **jest.config.js** (CommonJS): Rejected because the project is `"type": "module"`. Using `jest.config.ts` with `ts-jest` avoids ESM/CJS compatibility issues.

## Exceptions / risks

- `@/` path alias resolution requires `moduleNameMapper` — if a new path segment is added later, the mapper pattern may need updating.
- `jest-environment-jsdom` is a large dependency but required for future React component testing.
