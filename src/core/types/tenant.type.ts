export type TTenantUserRole = 'owner' | 'admin';

export type TTenant = {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly phone: string;
  readonly address: string;
  readonly users: TTenantUser[];
};

export type TTenantEntity = {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly phone: string;
  readonly address: string;
  readonly users: TTenantUserEntity[];
  readonly created_at: Date;
  readonly updated_at: Date;
};

export type TTenantUser = {
  readonly id: string;
  readonly user_id: string;
  readonly tenant_id: string;
  readonly role: TTenantUserRole;
};

export type TTenantUserEntity = {
  readonly id: string;
  readonly user_id: string;
  readonly tenant_id: string;
  readonly role: TTenantUserRole;
};
