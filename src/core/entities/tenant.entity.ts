import type { TTenant, TTenantEntity, TTenantUser } from '../types';

export class Tenant {
  private constructor(
    readonly id: string,
    readonly name: string,
    readonly slug: string,
    readonly phone: string,
    readonly address: string,
    readonly users: TTenantUser[],
  ) {}

  static fromJson(data: Partial<TTenant>) {
    return new Tenant(
      data?.id || '',
      data?.name || '',
      data?.slug || '',
      data?.phone || '',
      data?.address || '',
      data?.users?.map((u) => ({
        id: u?.id || '',
        tenant_id: u?.tenant_id || '',
        user_id: u?.user_id || '',
        role: u?.role || '',
      })) || [],
    );
  }

  static fromEntity(data: Partial<TTenantEntity>) {
    return new Tenant(
      data?.id || '',
      data?.name || '',
      data?.slug || '',
      data?.phone || '',
      data?.address || '',
      data?.users?.map((u) => ({
        id: u?.id || '',
        tenant_id: u?.tenant_id || '',
        user_id: u?.user_id || '',
        role: u?.role || '',
      })) || [],
    );
  }

  copyWith(data: Partial<TTenant>) {
    return new Tenant(
      data?.id || this.id,
      data?.name || this.name,
      data?.slug || this.slug,
      data?.phone || this.phone,
      data?.address || this.address,
      data?.users?.map((u) => ({
        id: u?.id || '',
        tenant_id: u?.tenant_id || '',
        user_id: u?.user_id || '',
        role: u?.role || '',
      })) || this.users,
    );
  }

  createSlug() {
    const slug = this.name.trim().replaceAll(' ', '-').toLowerCase();

    return this.copyWith({
      slug,
    });
  }

  isAdmin(userId: string) {
    return this.users.some((u) => u.user_id === userId && ['owner', 'admin'].includes(u.role));
  }
}
