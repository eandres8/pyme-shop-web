# Requirements: Add default categories on each new tenant

## Overview
When a new user registers as a tenant owner, the system must copy global categories (without tenant_id) to the new tenant, allowing users to edit them without affecting the default categories.

## Acceptance Criteria
1. **Tenant Creation Flow**: When a new tenant is created via `registerUserStore` server action, the system must:
   - Fetch all global categories (categories without tenant_id)
   - Create copies of these categories with the new tenant's ID
   - Maintain the same category names for the new tenant

2. **Category Filtering**: When categories are requested for the new product page:
   - Filter categories by tenant_id from session user info
   - Only return categories belonging to the tenant
   - Maintain the existing `getCategoryList` server action interface

3. **Database Constraints**: 
   - Fix the current `@unique` constraint on `Category.name` to allow same category names for different tenants
   - Change to `@@unique([name, tenant_id])` composite constraint

4. **Seed Data**:
   - Create seed data for global categories (without tenant_id)
   - Ensure these categories are available for copying to new tenants

5. **Testing**:
   - All existing tests must pass
   - New tests for the category copying functionality
   - Tests for tenant-specific category filtering

## Functional Requirements
- **FR1**: System must have a set of global default categories
- **FR2**: New tenants automatically receive copies of all global categories
- **FR3**: Tenant categories are independent - editing one tenant's categories doesn't affect others
- **FR4**: Categories are filtered by tenant_id in all tenant-specific operations
- **FR5**: The system maintains backward compatibility with existing functionality

## Non-Functional Requirements
- **NFR1**: Performance - Category copying should not significantly impact tenant creation time
- **NFR2**: Scalability - Solution should work with many tenants and categories
- **NFR3**: Maintainability - Code should be clear and follow existing patterns

## Technical Constraints
- Use existing Prisma 7 patterns and repository structure
- Follow dependency injection pattern for repositories
- Maintain existing API contracts where possible
- Use the existing `Result<T>` pattern for error handling

## Dependencies
- Prisma schema changes (Category model)
- Tenant repository modifications
- Category repository updates
- Server action updates
- Test updates