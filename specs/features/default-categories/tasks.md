# Implementation Tasks: Add default categories on each new tenant

## Phase 1: Database Schema Changes

### Task 1.1: Update Prisma Schema
**File**: `prisma/schema.prisma`
**Description**: Fix Category model constraints
**Actions**:
1. Remove `@unique` from `Category.name`
2. Add `@@unique([name, tenant_id])` composite constraint
3. Ensure `tenant_id` index exists
4. Verify the change doesn't break existing queries

**Estimated Time**: 30 minutes
**Dependencies**: None
**Status**: Pending

### Task 1.2: Create Prisma Migration
**Description**: Generate and apply migration for schema changes
**Actions**:
1. Run `pnpm dlx prisma generate` to update client
2. Run `pnpm dlx prisma migrate dev --name add-category-unique-constraint`
3. Verify migration succeeds
4. Test basic queries work

**Estimated Time**: 15 minutes
**Dependencies**: Task 1.1
**Status**: Pending

## Phase 2: Seed Data Implementation

### Task 2.1: Create Default Categories Seed Function
**File**: `prisma/seed/seed.ts`
**Description**: Add function to seed global categories
**Actions**:
1. Add `seedDefaultCategories()` function
2. Define list of default categories (Electronics, Clothing, etc.)
3. Use upsert to avoid duplicates
4. Ensure categories have `tenant_id = NULL`

**Estimated Time**: 45 minutes
**Dependencies**: Task 1.2
**Status**: Pending

### Task 2.2: Update Seed Runner
**File**: `prisma/seed/seed.ts`
**Description**: Integrate category seeding into main seed flow
**Actions**:
1. Call `seedDefaultCategories()` from main seed function
2. Ensure proper ordering (categories before products)
3. Add error handling
4. Update seed script in package.json if needed

**Estimated Time**: 30 minutes
**Dependencies**: Task 2.1
**Status**: Pending

## Phase 3: Repository Updates

### Task 3.1: Update Category Repository Interface
**File**: `src/server/interfaces/category.interface.ts`
**Description**: Add new method for copying categories
**Actions**:
1. Add `copyGlobalCategoriesToTenant(tenantId: string)` method signature
2. Update return type to `Result<Category[]>`
3. Ensure backward compatibility

**Estimated Time**: 15 minutes
**Dependencies**: Task 1.2
**Status**: Pending

### Task 3.2: Implement Category Copy Method
**File**: `src/server/repositories/category.repository.ts`
**Description**: Add implementation for copying global categories
**Actions**:
1. Add `copyGlobalCategoriesToTenant()` method
2. Query categories where `tenant_id IS NULL`
3. Create copies with new `tenant_id`
4. Use batch operations for performance
5. Return copied categories

**Estimated Time**: 60 minutes
**Dependencies**: Task 3.1
**Status**: Pending

### Task 3.3: Update Tenant Repository
**File**: `src/server/repositories/tenant.repository.ts`
**Description**: Modify `createWithAdmin()` to copy categories
**Actions**:
1. Inject `categoryRepository` dependency
2. Call `copyGlobalCategoriesToTenant()` in transaction
3. Handle errors gracefully
4. Maintain transaction integrity

**Estimated Time**: 45 minutes
**Dependencies**: Task 3.2
**Status**: Pending

## Phase 4: Server Action Updates

### Task 4.1: Update getCategoryList Action
**File**: `src/server/actions/products/get-category-list.ts`
**Description**: Ensure proper tenant filtering
**Actions**:
1. Review current implementation
2. Verify tenant_id is extracted from session
3. Update if needed to use session tenant_id
4. Add proper error handling

**Estimated Time**: 30 minutes
**Dependencies**: Task 3.3
**Status**: Pending

### Task 4.2: Update Register Store Action
**File**: `src/server/actions/auth/register-store.ts`
**Description**: Verify tenant creation flow works with category copying
**Actions**:
1. Test the complete flow
2. Verify categories are copied
3. Handle any errors
4. Update comments/documentation

**Estimated Time**: 30 minutes
**Dependencies**: Task 3.3
**Status**: Pending

## Phase 5: Testing Updates

### Task 5.1: Update Category Repository Tests
**File**: `src/server/repositories/category.repository.test.ts`
**Description**: Add tests for new functionality
**Actions**:
1. Add tests for `copyGlobalCategoriesToTenant()`
2. Test with no global categories
3. Test with multiple global categories
4. Test error handling
5. Update existing tests if needed

**Estimated Time**: 60 minutes
**Dependencies**: Task 3.2
**Status**: Pending

### Task 5.2: Update Tenant Repository Tests
**File**: `src/server/repositories/tenant.repository.test.ts`
**Description**: Update tests for category copying
**Actions**:
1. Mock `categoryRepository.copyGlobalCategoriesToTenant()`
2. Test that categories are copied during tenant creation
3. Test transaction rollback on category copy failure
4. Update existing tests

**Estimated Time**: 60 minutes
**Dependencies**: Task 3.3
**Status**: Pending

### Task 5.3: Update Server Action Tests
**File**: `src/server/actions/products/get-category-list.test.ts`
**Description**: Update tests for tenant filtering
**Actions**:
1. Test `getCategoryList()` with tenant_id parameter
2. Test without tenant_id (should return all categories)
3. Mock repository calls
4. Verify correct filtering

**Estimated Time**: 45 minutes
**Dependencies**: Task 4.1
**Status**: Pending

## Phase 6: Integration Testing

### Task 6.1: End-to-End Test
**Description**: Test complete tenant creation flow
**Actions**:
1. Create a new tenant via API
2. Verify categories are copied
3. Test category filtering in product creation
4. Verify all tests pass

**Estimated Time**: 60 minutes
**Dependencies**: All previous tasks
**Status**: Pending

### Task 6.2: Performance Testing
**Description**: Verify performance with many categories
**Actions**:
1. Create seed data with 50+ categories
2. Test tenant creation time
3. Verify no timeouts or errors
4. Optimize if needed

**Estimated Time**: 30 minutes
**Dependencies**: Task 6.1
**Status**: Pending

## Phase 7: Documentation and Cleanup

### Task 7.1: Update Documentation
**Description**: Update relevant documentation
**Actions**:
1. Update API documentation for category endpoints
2. Update developer guide for tenant creation
3. Add comments to complex code sections
4. Update README if needed

**Estimated Time**: 30 minutes
**Dependencies**: All previous tasks
**Status**: Pending

### Task 7.2: Code Review and Cleanup
**Description**: Final review and cleanup
**Actions**:
1. Run linter and fix any issues
2. Remove any debug code
3. Verify all tests pass
4. Prepare for deployment

**Estimated Time**: 30 minutes
**Dependencies**: All previous tasks
**Status**: Pending

## Task Dependencies Summary
```
Phase 1: 1.1 → 1.2
Phase 2: 1.2 → 2.1 → 2.2
Phase 3: 1.2 → 3.1 → 3.2 → 3.3
Phase 4: 3.3 → 4.1 → 4.2
Phase 5: 3.2 → 5.1, 3.3 → 5.2, 4.1 → 5.3
Phase 6: All previous → 6.1 → 6.2
Phase 7: All previous → 7.1 → 7.2
```

## Total Estimated Time: 8-10 hours

## Success Criteria
1. All tests pass (unit, integration, end-to-end)
2. New tenants automatically receive default categories
3. Categories are properly filtered by tenant_id
4. No performance degradation
5. Backward compatibility maintained
6. Code follows existing patterns and conventions