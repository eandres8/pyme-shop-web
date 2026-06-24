# Design: Add default categories on each new tenant

## Architecture Overview
The solution involves three main components:
1. **Database Schema Changes**: Fix Category model constraints
2. **Seed Data**: Create global default categories
3. **Business Logic**: Copy categories during tenant creation

## Database Schema Changes

### Current Category Model Issues
```prisma
model Category {
  id         String    @id @default(uuid())
  name       String    @unique  // PROBLEM: Global unique constraint
  tenant_id  String?
  // ...
}
```

**Problem**: The `@unique` constraint on `name` prevents having the same category name for different tenants.

### Proposed Changes
```prisma
model Category {
  id         String    @id @default(uuid())
  name       String
  tenant_id  String?
  
  // Relations
  product    Product[]
  tenant     Tenant?   @relation(fields: [tenant_id], references: [id])

  @@unique([name, tenant_id])  // Composite unique constraint
  @@index([tenant_id])
  @@map("categories")
}
```

**Benefits**:
- Allows same category name for different tenants
- Maintains uniqueness within a tenant
- Global categories (tenant_id = NULL) remain unique

## Seed Data Strategy

### Global Categories
Create a set of default categories that will be available for all new tenants:
- Electronics
- Clothing
- Home & Garden
- Sports
- Books
- Beauty
- Toys
- Automotive
- Health
- Food & Beverages

### Seed Implementation
1. Create a new seed function `seedDefaultCategories()` in `prisma/seed/seed.ts`
2. Insert categories with `tenant_id = NULL`
3. Use upsert to avoid duplicates on multiple seed runs

## Business Logic Changes

### 1. Tenant Repository Updates

**File**: `src/server/repositories/tenant.repository.ts`

Modify `createWithAdmin()` method to:
1. Fetch all global categories (where `tenant_id IS NULL`)
2. Create copies with the new tenant's ID
3. Include this in the existing transaction

```typescript
// Pseudo-code
async createWithAdmin(tenant: Tenant, userId: string) {
  return client.$transaction(async (tx) => {
    // 1. Create tenant
    const newTenant = await tx.tenant.create({ ... });
    
    // 2. Link user as owner
    await tx.tenantUser.create({ ... });
    
    // 3. Copy global categories to tenant
    const globalCategories = await tx.category.findMany({
      where: { tenant_id: null }
    });
    
    if (globalCategories.length > 0) {
      await tx.category.createMany({
        data: globalCategories.map(cat => ({
          name: cat.name,
          tenant_id: newTenant.id
        }))
      });
    }
    
    return newTenant;
  });
}
```

### 2. Category Repository Updates

**File**: `src/server/repositories/category.repository.ts`

No changes needed to existing methods, but add a new method:
```typescript
async copyGlobalCategoriesToTenant(tenantId: string) {
  // Implementation for copying global categories
}
```

### 3. Server Action Updates

**File**: `src/server/actions/products/get-category-list.ts`

Current implementation already supports tenant filtering:
```typescript
export async function getCategoryList(tenantId?: string) {
  return categoryRepository.listCategories(tenantId);
}
```

**Note**: The tenant_id should be extracted from the session in the calling component, not passed as a parameter.

### 4. Tenant Client Updates

**File**: `src/config/database/prisma-tenant-client.ts`

The existing `createTenantClient()` already injects `tenant_id` automatically for queries. No changes needed.

## Testing Strategy

### Unit Tests
1. **Category Repository Tests**:
   - Test `copyGlobalCategoriesToTenant()` method
   - Test that global categories are correctly copied
   - Test error handling

2. **Tenant Repository Tests**:
   - Test that `createWithAdmin()` now copies categories
   - Test transaction rollback on failure
   - Test with existing global categories

3. **Server Action Tests**:
   - Test `getCategoryList()` with tenant filter
   - Test that categories are tenant-specific

### Integration Tests
1. Test complete tenant creation flow
2. Verify categories are copied correctly
3. Test category filtering in product creation

### Test Files to Update
- `src/server/repositories/category.repository.test.ts`
- `src/server/repositories/tenant.repository.test.ts`
- `src/server/actions/products/get-category-list.test.ts`

## Migration Strategy

### Step 1: Schema Migration
Create a Prisma migration to:
1. Remove `@unique` from `Category.name`
2. Add `@@unique([name, tenant_id])`
3. Add index on `tenant_id`

### Step 2: Seed Data
Run seed to populate global categories.

### Step 3: Code Deployment
Deploy changes in order:
1. Schema migration
2. Seed data
3. Repository changes
4. Server action changes
5. Test updates

## Risk Assessment

### High Risk
- **Data Loss**: Changing unique constraint could affect existing data
  - **Mitigation**: Migration script to handle existing data
- **Transaction Complexity**: Adding category copying to tenant creation transaction
  - **Mitigation**: Keep transaction simple, handle errors gracefully

### Medium Risk
- **Performance**: Additional database operations during tenant creation
  - **Mitigation**: Optimize queries, use batch operations
- **Backward Compatibility**: Existing functionality might break
  - **Mitigation**: Comprehensive testing, gradual rollout

### Low Risk
- **Seed Data**: Categories might not match user expectations
  - **Mitigation**: Make categories configurable, allow easy modification

## Implementation Phases

### Phase 1: Database Changes
1. Update Prisma schema
2. Create migration
3. Update seed data

### Phase 2: Repository Updates
1. Update tenant repository
2. Update category repository
3. Add new methods

### Phase 3: Business Logic
1. Update server actions
2. Update tenant client if needed
3. Update components

### Phase 4: Testing
1. Update unit tests
2. Add new tests
3. Run integration tests

### Phase 5: Documentation
1. Update API documentation
2. Update developer guides
3. Update deployment notes