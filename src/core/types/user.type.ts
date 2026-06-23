import type { TTenantUserEntity, TUserTenant } from "./tenant.type";

export type TUserRole = 'admin' | 'user';

export type TUser = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly email_verified: string;
  readonly password: string;
  readonly role: TUserRole;
  readonly image: string;
  readonly tenant: TUserTenant;
};

export type TUserEntity = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly emailVerified: Date;
  readonly password: string;
  readonly role: TUserRole;
  readonly image: string;
  readonly tenantUsers: TTenantUserEntity[];
  readonly created_at: Date;
  readonly updated_at: Date;
};

export type TPublicUser = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly email_verified: string;
  readonly role: TUserRole;
  readonly image: string;
  readonly tenant: string;
};