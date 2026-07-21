import { Tenant, TenantUser } from '@/src/core/entities';
import { Result } from '@/src/core/utils';

export interface ITenantRepository {
  create(tenant: Tenant): Promise<Result<Tenant>>;
  findById(id: string): Promise<Result<Tenant>>;
  findBySlug(slug: string): Promise<Result<Tenant>>;
  listSlugs(): Promise<Result<string[]>>;
  createWithAdmin(tenant: Tenant, adminUserId: string): Promise<Result<Tenant>>;
  addUser(tenantId: string, userId: string, role: string): Promise<Result<TenantUser>>;
  listUsers(tenantId: string): Promise<Result<TenantUser[]>>;
  removeUser(tenantId: string, userId: string): Promise<Result<number>>;
  findByAdminId(userId: string): Promise<Result<Tenant>>;
}
