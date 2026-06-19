# DL_4_fix_testing_actions — Requirements (EARS)

## Ubiquitous

- **R1**: No server action source file SHALL be modified — all existing public exports (`registerUser`, `placeOrder`, etc.) SHALL remain unchanged.
- **R2**: All server action tests SHALL use `jest.mock()` to mock the `../../providers` module that actions import repositories from — no test SHALL use dependency injection via factory function imports.
- **R3**: Every test SHALL import and call the public action function directly (e.g., `registerUser(data)`, `placeOrder(products, address)`), not a factory wrapper.
- **R4**: The `@/src/auth.config` module SHALL be mocked via `jest.mock()` in every test file where the action calls `auth()` internally.

## Event-driven

- **R5**: When `registerUser` is called with valid data and the mock `userRepository.create` returns success, the returned promise SHALL resolve to `{ success: true, data: TPublicUser }`.
- **R6**: When `registerUser` is called and the mock `userRepository.create` returns failure, the returned promise SHALL resolve to `{ success: false, message: "No se pudo crear el usuario" }`.
- **R7**: When `placeOrder` is called with products, address, and valid session, the action SHALL calculate subtotal, tax (15%), total, and call `orderRepository.trxNewOrder` with the correct payload.
- **R8**: When any action that calls `auth()` is invoked, the mock `auth` from `@/src/auth.config` SHALL be configurable per test via `jest.fn()`.
- **R9**: When `changeUserRole` is called with a non-admin session, the action SHALL return `{ success: false, message: "No es un usuario válido" }` without calling `userRepository.changeRole`.
- **R10**: When `placeOrder` is called without a session, the action SHALL return `{ success: false, message: "No hay una sesión válida" }`.
- **R11**: When `getPaginatedProductsWithImages` is called and the repository call fails, the action SHALL throw the error.
- **R12**: When `deleteProductImage` is called with an invalid URL (not starting with `https://`), the action SHALL return `{ success: false, message: "Invalid image URL" }` without calling any repository.
- **R13**: When `setUserAddress` is called with a userId that has no existing address, `userAddressRepository.findByUserId` SHALL be called first and then `userAddressRepository.create` SHALL be called with the new address.
- **R14**: When `getOrderById` is called with a non-owner user, the action SHALL throw `new Error('No hay permisos para esta consulta')`.

## State-driven

- **R15**: While `pnpm dlx jest --passWithNoTests` is executed, all 30 test suites SHALL pass without requiring a database connection.
- **R16**: While `pnpm lint` is executed, no new errors or warnings SHALL appear.

## Unwanted behavior

- **R17**: If a test imports a non-existent factory function (`xxxAction`) from an action module, the test SHALL fail with a clear error.
- **R18**: If a mock provider is missing a method that the action calls, the test SHALL fail with a runtime error, not silently pass.
