import type { TTenantUser, TTenantUserEntity, TTenantUserRole } from '../types';

export class TenantUser {
  private constructor(
    readonly id: string,
    readonly userId: string,
    readonly tenantId: string,
    readonly role: TTenantUserRole,
  ) {}

  static fromJson(data: Partial<TTenantUser>) {
    return new TenantUser(
      data?.id || '',
      data?.user_id || '',
      data?.tenant_id || '',
      data?.role || 'admin',
    );
  }

  static fromEntity(data: Partial<TTenantUserEntity>) {
    return new TenantUser(
      data?.id || '',
      data?.user_id || '',
      data?.tenant_id || '',
      data?.role || 'admin',
    );
  }
}
