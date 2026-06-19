# DL_2_testing_actions — Tasks

## Prerequisites

- [ ] Jest is configured and running (verified by DL_1_jest_config).
- [ ] The project builds successfully (`pnpm build`).
- [ ] All existing tests pass (`pnpm test`).

## Refactoring phase — Export factory functions

- [ ] **T1** Export `registerUserAction` in `src/server/actions/auth/register.ts`. (R1)
- [ ] **T2** Export `changeUserRoleAction` in `src/server/actions/users/change-user-role.ts`. (R1)
- [ ] **T3** Export `getOrderByIdAction` in `src/server/actions/order/get-order-by-id.ts`. (R1)
- [ ] **T4** Export `getPaginatedOrdersAction` in `src/server/actions/order/get-paginated-orders.ts`. (R1)
- [ ] **T5** Export `getOrderListByUserAction` in `src/server/actions/order/get-order-list-by-user.ts`. (R1)
- [ ] **T6** Export `placeOrderAction` in `src/server/actions/order/place-order.ts`. (R1)
- [ ] **T7** Export `setUserAddressAction` in `src/server/actions/address/set-user-address.ts`. (R1)

## Mock phase — Create test infrastructure

- [ ] **T8** Create `tests/mocks/repositories/index.ts` barrel. (R2)
- [ ] **T9** Create `tests/mocks/repositories/user.repository.mock.ts`. (R2)
- [ ] **T10** Create `tests/mocks/repositories/order.repository.mock.ts`. (R2)
- [ ] **T11** Create `tests/mocks/repositories/user-address.repository.mock.ts`. (R2)
- [ ] **T12** Create `tests/mocks/repositories/product.repository.mock.ts`. (R2)
- [ ] **T13** Create `tests/mocks/repositories/category.repository.mock.ts`. (R2)
- [ ] **T14** Create `tests/mocks/repositories/country.repository.mock.ts`. (R2)
- [ ] **T15** Create `tests/mocks/repositories/product-image.repository.mock.ts`. (R2)
- [ ] **T16** Create `tests/mocks/repositories/upload-files.repository.mock.ts`. (R2)

## Test phase — Write tests (TDD)

- [ ] **T17** Create `src/server/actions/auth/register.test.ts` — tests R5 (success), R6 (failure). (R4)
- [ ] **T18** Create `src/server/actions/auth/login.test.ts` — tests R22 (CredentialsSignin), R23 (re-throw). (R4)
- [ ] **T19** Create `src/server/actions/users/change-user-role.test.ts` — tests R7 (non-admin), R8 (admin + success). (R4)
- [ ] **T20** Create `src/server/actions/order/get-order-by-id.test.ts` — tests R9 (owner), R10 (unauthenticated), R11 (non-owner). (R4)
- [ ] **T21** Create `src/server/actions/order/get-paginated-orders.test.ts` — tests R15 (admin), R16 (non-admin). (R4)
- [ ] **T22** Create `src/server/actions/order/get-order-list-by-user.test.ts` — tests R17 (authenticated), R18 (unauthenticated). (R4)
- [ ] **T23** Create `src/server/actions/order/place-order.test.ts` — tests R19 (calculations + trxNewOrder call), R20 (no session), R21 (product lookup failure). (R4)
- [ ] **T24** Create `src/server/actions/address/set-user-address.test.ts` — tests R12 (create path), R13 (update path), R14 (findByUserId failure throws). (R4)

## Verification phase

- [ ] **T25** Run `pnpm test` — all tests pass (24 existing utils tests + new action tests). (R24, R25)
- [ ] **T26** Run `pnpm lint` — no new errors or warnings.
