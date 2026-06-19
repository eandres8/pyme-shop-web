# DL_2_testing_actions — Requirements (EARS)

## Ubiquitous

- **R1**: Every server action factory function (`xxxAction`) SHALL be exported from its module to allow dependency injection of mock repositories in tests.
- **R2**: The project SHALL provide mock implementations for every repository interface in `/tests/mocks/repositories/`.
- **R3**: Every exported action (`export const xxx = ...`) SHALL use the factory function with `inject()` — no action SHALL instantiate dependencies inline.
- **R4**: All server action tests SHALL reside under `src/server/actions/` following the same directory structure as the source files, with `.test.ts` extension.

## Event-driven

- **R5**: When `registerUserAction(userRepository)` is called with a valid user payload and a mock repository that returns success, the returned promise SHALL resolve to `{ success: true, data: TPublicUser }`.
- **R6**: When `registerUserAction(userRepository)` is called and the mock repository returns a `Result.failure`, the returned promise SHALL resolve to `{ success: false, message: string }`.
- **R7**: When `changeUserRoleAction(userRepository)` is called with a non-admin session, the returned promise SHALL resolve to `{ success: false, message: "No es un usuario válido" }` without calling `userRepository.changeRole`.
- **R8**: When `changeUserRoleAction(userRepository)` is called with an admin session and a successful repository call, the returned promise SHALL resolve to `{ success: true, data: TPublicUser }`.
- **R9**: When `getOrderByIdAction(orderRepository)` is called with a valid `id` and an authenticated user who owns the order, the returned promise SHALL resolve to `{ success: true, data: TOrderDetail }`.
- **R10**: When `getOrderByIdAction(orderRepository)` is called without an authenticated session, the returned promise SHALL resolve to `{ success: false, message: "Usuario no autenticado" }`.
- **R11**: When `getOrderByIdAction(orderRepository)` is called with a non-owner `user` role, the action SHALL throw `new Error('No hay permisos para esta consulta')`.
- **R12**: When `setUserAddressAction(userAddressRepository)` is called with a userId that has no existing address, the mock `findByUserId` SHALL be called first, and then `create` SHALL be called with the new address.
- **R13**: When `setUserAddressAction(userAddressRepository)` is called with a userId that already has an address, the mock `findByUserId` SHALL be called first, and then `update` SHALL be called with the modified address.
- **R14**: When `setUserAddressAction(userAddressRepository)` is called and `findByUserId` returns a `Result.failure`, the action SHALL throw the error.
- **R15**: When `getPaginatedOrdersAction(orderRepository)` is called with an admin session, the returned promise SHALL resolve to `{ success: true, data: TOrderResume[] }`.
- **R16**: When `getPaginatedOrdersAction(orderRepository)` is called with a non-admin session, the returned promise SHALL resolve to `{ success: false, message: "No es un usuario válido" }`.
- **R17**: When `getOrderListByUserAction(orderRepository)` is called with an authenticated session, the action SHALL call `orderRepository.listOrdersByUser(session.user.id)` and return the mapped data.
- **R18**: When `getOrderListByUserAction(orderRepository)` is called without a session, the returned promise SHALL resolve to `{ success: false, message: "Usuario no autenticado" }`.
- **R19**: When `placeOrderAction(productRepository, orderRepository)` is called with products, an address, and a valid session, the action SHALL calculate subtotal, tax (15%), total (subtotal × 1.15), and call `orderRepository.trxNewOrder` with the correct payload.
- **R20**: When `placeOrderAction(productRepository, orderRepository)` is called without a session, the returned promise SHALL resolve to `{ success: false, message: "No hay una sesión válida" }`.
- **R21**: When `placeOrderAction(productRepository, orderRepository)` is called and `productRepository.listProductsByIds` returns a failure, the action SHALL propagate the failure message.
- **R22**: When `authenticate` is called with invalid credentials (CredentialsSignin error), the function SHALL return `'Invalid credentials.'`.
- **R23**: When `authenticate` is called and `signIn` throws a non-AuthError, the error SHALL be re-thrown.

## State-driven

- **R24**: While `pnpm test` is executed, all tests under `src/server/actions/` SHALL pass without requiring a database connection.
- **R25**: While development dependencies include `jest-mock-extended` or equivalent, mock repositories SHALL use manual implementations (no auto-mocking library) to keep dependencies minimal.

## Unwanted behavior

- **R26**: If any server action imports a repository directly without the factory pattern (i.e., calls `inject()` inline instead of receiving the dependency as a parameter), the test for that action SHALL fail with a reference error unless the factory export is added first.
- **R27**: If the `/tests/mocks/repositories/` directory is missing a mock for a repository used by a tested action, the test SHALL fail with a module-not-found error.
