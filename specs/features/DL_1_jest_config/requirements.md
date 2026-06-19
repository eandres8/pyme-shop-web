# DL_1_jest_config — Requirements (EARS)

## Ubiquitous

- **R1**: The project SHALL always include Jest and the following dependencies as `devDependencies` in `package.json`: `jest`, `@jest/types`, `ts-jest`, `@types/jest`, `jest-environment-jsdom`.
- **R2**: The project SHALL provide a `test` script in `package.json` that runs Jest and exits with a non-zero code on failure.

## Event-driven

- **R3**: When `pnpm test` is executed, Jest SHALL run all test files matching `**/*.test.{ts,tsx}` under `src/`.
- **R4**: When a utility function in `src/shared/utils/` is exported, Jest SHALL verify its behavior through at least one dedicated test file co-located at `src/shared/utils/<module>/<module>.test.ts`.
- **R5**: When `currencyFormat(value)` is called, Jest SHALL verify that the function returns a string formatted as USD currency (e.g., `currencyFormat(1234.5)` → `"$1,234.50"`).
- **R6**: When `generatePaginationNumbers(currentPage, totalPages)` is called with valid numeric arguments, Jest SHALL verify:
  - **R6.1** — If `totalPages <= 7`, the result is `[1, 2, ..., totalPages]`.
  - **R6.2** — If `currentPage <= 3` and `totalPages > 7`, the result starts with `[1, 2, 3, "...", totalPages - 1, totalPages]`.
  - **R6.3** — If `currentPage >= totalPages - 2` and `totalPages > 7`, the result ends with `[... , totalPages - 2, totalPages - 1, totalPages]`.
  - **R6.4** — Otherwise, the result contains `[1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages]`.

## State-driven

- **R7**: While Jest is running, it SHALL use `ts-jest` as the transformer for `.ts` and `.tsx` files so that TypeScript sources do not require a pre-build step.

## Unwanted behavior

- **R8**: If a test file imports a path alias (`@/...`), Jest SHALL resolve it via a `moduleNameMapper` configuration, otherwise the test SHALL fail with a module-not-found error.
