import type { TUser, TUserEntity } from "../types";

export class User {
  private constructor(
    readonly id: string,
    readonly name: string,
    readonly email: string,
    readonly emailVerified: Date | null,
    readonly password: string,
    readonly role: string,
    readonly image: string,
  ) {}

  static fromJson(data: Partial<TUser>) {
    return new User(
      data?.id || '',
      data?.name || '',
      data?.email || '',
      data?.email_verified ? new Date(data.email_verified) : null,
      data?.password || '',
      data?.role || '',
      data?.image || '',
    );
  }
  
  static fromEntity(data: Partial<TUserEntity>) {
    return new User(
      data?.id || '',
      data?.name || '',
      data?.email || '',
      data?.emailVerified || null,
      data?.password || '',
      data?.role || '',
      data?.image || '',
    );
  }
}