import { UserAddress } from "@/src/core/entities";
import { Result } from "@/src/core/utils";
import type { IUserAddressRepository } from "@/src/server/interfaces";

type MockOverrides = {
  findByUserId?: (userId: string) => ReturnType<IUserAddressRepository["findByUserId"]>;
  create?: (address: UserAddress) => ReturnType<IUserAddressRepository["create"]>;
  update?: (address: UserAddress) => ReturnType<IUserAddressRepository["update"]>;
  remove?: (userId: string) => ReturnType<IUserAddressRepository["remove"]>;
};

export function MockUserAddressRepository(overrides: MockOverrides = {}): IUserAddressRepository {
  return {
    findByUserId: overrides.findByUserId ?? (async () => Result.success(UserAddress.fromJson({}))),
    create: overrides.create ?? (async (address) => Result.success(address)),
    update: overrides.update ?? (async (address) => Result.success(address)),
    remove: overrides.remove ?? (async () => Result.success(UserAddress.fromJson({}))),
  };
}
