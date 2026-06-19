import { UserAddress } from "@/src/core/entities";
import { Result } from "@/src/core/utils";

export interface IUserAddressRepository {
  findByUserId(userId: string): Promise<Result<UserAddress>>;
  create(address: UserAddress): Promise<Result<UserAddress>>;
  update(address: UserAddress): Promise<Result<UserAddress>>;
  remove(userId: string): Promise<Result<UserAddress>>;
}
