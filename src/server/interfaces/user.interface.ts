import { User } from "@/src/core/entities";
import { Result } from "@/src/core/utils";

export interface IUserRepository {
  create(user: User): Promise<Result<User>>;
  findByEmail(email: string): Promise<Result<User>>;
  findByTenant(tenant: string): Promise<Result<User[]>>;
  changeRole(userId: string, newRole: string): Promise<Result<User>>;
}