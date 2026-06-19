import type { IUserRepository } from "@/src/server/interfaces";
import { User } from "@/src/core/entities";
import { Result } from "@/src/core/utils";

type MockOverrides = {
  create?: (user: User) => ReturnType<IUserRepository["create"]>;
  findByEmail?: (email: string) => ReturnType<IUserRepository["findByEmail"]>;
  findByTenant?: (tenant: string) => ReturnType<IUserRepository["findByTenant"]>;
  changeRole?: (userId: string, role: string) => ReturnType<IUserRepository["changeRole"]>;
};

export function MockUserRepository(overrides: MockOverrides = {}): IUserRepository {
  return {
    create: overrides.create ?? (async (user) => Result.success(user)),
    findByEmail: overrides.findByEmail ?? (async () => Result.success(User.fromJson({}))),
    findByTenant: overrides.findByTenant ?? (async () => Result.success([])),
    changeRole: overrides.changeRole ?? (async () => Result.success(User.fromJson({}))),
  };
}
