import type { TTenant, TTenantEntity } from '../types';

export class Tenant {
  private constructor(
    readonly id: string,
    readonly name: string,
    readonly slug: string,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static fromJson(data: Partial<TTenant>) {
    return new Tenant(
      data?.id || '',
      data?.name || '',
      data?.slug || '',
      data?.created_at ? new Date(data.created_at) : new Date(),
      data?.updated_at ? new Date(data.updated_at) : new Date(),
    );
  }

  static fromEntity(data: Partial<TTenantEntity>) {
    return new Tenant(
      data?.id || '',
      data?.name || '',
      data?.slug || '',
      data?.created_at || new Date(),
      data?.updated_at || new Date(),
    );
  }

  copyWith(data: Partial<TTenant>) {
    return new Tenant(
      data?.id || this.id,
      data?.name || this.name,
      data?.slug || this.slug,
      data?.created_at ? new Date(data.created_at) : this.createdAt,
      data?.updated_at ? new Date(data.updated_at) : this.updatedAt,
    );
  }
}
