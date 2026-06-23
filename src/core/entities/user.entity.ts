import bcrypt from "bcryptjs";

import type { TPublicUser, TUser, TUserEntity, TUserRole, TUserTenant } from "../types";

export class User {
  private constructor(
    readonly id: string,
    readonly name: string,
    readonly email: string,
    readonly emailVerified: Date | null,
    readonly password: string,
    readonly role: TUserRole,
    readonly image: string,
    readonly tenant: TUserTenant,
  ) {}

  static fromJson(data: Partial<TUser>) {
    return new User(
      data?.id || '',
      data?.name || '',
      data?.email?.toLowerCase() || '',
      data?.email_verified ? new Date(data.email_verified) : null,
      data?.password || '',
      data?.role || 'user',
      data?.image || '',
      {
        id: data?.tenant?.id || '',
        address: data?.tenant?.address || '',
        name: data?.tenant?.name || '',
        phone: data?.tenant?.phone || '',
        slug: data?.tenant?.slug || '',
        role: data?.tenant?.role || '',
      }
    );
  }
  
  static fromEntity(data: Partial<TUserEntity>) {
    return new User(
      data?.id || '',
      data?.name || '',
      data?.email?.toLowerCase() || '',
      data?.emailVerified || null,
      data?.password || '',
      data?.role || 'user',
      data?.image || '',
      {
        id: data?.tenantUsers?.at(0)?.tenant?.id || '',
        address: data?.tenantUsers?.at(0)?.tenant?.address || '',
        name: data?.tenantUsers?.at(0)?.tenant?.name || '',
        phone: data?.tenantUsers?.at(0)?.tenant?.phone || '',
        slug: data?.tenantUsers?.at(0)?.tenant?.slug || '',
        role: data?.tenantUsers?.at(0)?.role || '',
      }
    );
  }

  copyWith(data: Partial<TUser>) {
    return new User(
      data?.id || this.id,
      data?.name || this.name,
      data?.email?.toLowerCase() || this.email,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data?.email_verified || this.emailVerified as any,
      data?.password || this.password,
      data?.role || this.role,
      data?.image || this.image,
      data?.tenant || this.tenant,
    );
  }

  cipherPass() {
    if (!this.password) {
      throw new Error('Invalid password');
    }

    return this.copyWith({
      password: bcrypt.hashSync(this.password),
    });
  }

  toAdmin() {
    return this.copyWith({
      role: 'admin',
    });
  }

  toPublic(): TPublicUser {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      email_verified: this.emailVerified?.toISOString() || '',
      role: this.role as TUserRole,
      image: this.image,
      tenant: ['owner', 'admin'].includes(this.tenant.role) ? this.tenant.id : '',
    };
  }
}