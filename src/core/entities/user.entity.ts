import bcrypt from "bcryptjs";
import type { TPublicUser, TUser, TUserEntity, TUserRole } from "../types";

export class User {
  private constructor(
    readonly id: string,
    readonly name: string,
    readonly email: string,
    readonly emailVerified: Date | null,
    readonly password: string,
    readonly role: TUserRole,
    readonly image: string,
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
    };
  }
}