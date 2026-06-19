import { PrismaClient } from "@/prisma/generated/prisma/client";
import { UserAddress } from "@/src/core/entities";
import type { TUserAddressEntity } from "@/src/core/types";
import { Logger, Result, to } from "@/src/core/utils";
import type { IUserAddressRepository } from "../interfaces";

export function UserAddressRepository(client: PrismaClient): IUserAddressRepository {
  const logger = Logger("UserAddressRepository");
  const userAddress = client.userAddress;

  const findByUserId = async (userId: string) => {
    const [data, error] = await to(
      userAddress.findUnique({
        where: { user_id: userId, is_active: true },
      }),
    );

    if (error) {
      logger.error({ error });
      return Result.failure(
        new Error(
          error?.message || "Error consultando las direcciones del usuario",
        ),
      );
    }

    return Result.success(
      UserAddress.fromEntity(data as unknown as TUserAddressEntity),
    );
  };

  const create = async (address: UserAddress) => {
    const [result, error] = await to(
      userAddress.create({
        data: {
          ...address.toJson(),
        },
      }),
    );

    if (error) {
      logger.log({ error });
      return Result.failure(
        new Error(error?.message || "Error creando la dirección"),
      );
    }

    const data = UserAddress.fromEntity(result as unknown as TUserAddressEntity);

    return Result.success(data);
  };
  
  const update = async (address: UserAddress) => {
    const [result, error] = await to(
      userAddress.update({
        where: {
          user_id: address.userId,
        },
        data: {
          ...address.toJson(),
        },
      }),
    );

    if (error) {
      logger.log({ error });
      return Result.failure(
        new Error(error?.message || "Error actualizando la dirección"),
      );
    }

    const data = UserAddress.fromEntity(result as unknown as TUserAddressEntity);

    return Result.success(data);
  };

  const remove = async (userId: string) => {
    const [result, error] = await to(
      userAddress.delete({
        where: {
          user_id: userId,
        },
      }),
    );

    if (error) {
      logger.log({ error });
      return Result.failure(
        new Error(error?.message || "Error desactivando la dirección"),
      );
    }

    const data = UserAddress.fromEntity(result as unknown as TUserAddressEntity);

    return Result.success(data);
  };

  return {
    findByUserId,
    create,
    update,
    remove,
  };
}
