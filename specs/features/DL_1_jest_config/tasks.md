# DL_1_jest_config — Tasks

## Prerequisites

- [ ] Repository is cloned, `pnpm install` has been run.
- [ ] No existing Jest configuration exists (verified in #1).

## Implementation order

- [ ] **T1** Install Jest and dependencies with pnpm. (R1)
      `pnpm add -D jest @types/jest ts-jest jest-environment-jsdom`
- [ ] **T2** Create `jest.config.ts` at project root with `ts-jest` preset, `jsdom` environment, `@/` path alias mapper, and test file pattern. (R3, R7, R8)
- [ ] **T3** Add `"test": "jest"` script to `package.json`. (R2)
- [ ] **T4** Add `@types/jest` to `tsconfig.json` `compilerOptions.types` (or use `/// <reference types="jest" />` in test files). (R4)
- [ ] **T5** Verify setup: run `pnpm test` — should output "No tests found" but exit with code 0 (Jest works). (R2, R3)
- [ ] **T6** Create `src/shared/utils/currenty-format/currency-format.util.test.ts` with tests for `currencyFormat()`. (R5)
- [ ] **T7** Create `src/shared/utils/generate-pagination-numbers/generate-pagination-numbers.util.test.ts` with tests for `generatePaginationNumbers()`. (R6.1–R6.4)
- [ ] **T8** Run `pnpm test` — all tests pass green. (R2, R4)
