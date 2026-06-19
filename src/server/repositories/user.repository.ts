import { PrismaClient } from "@/prisma/generated/prisma/client";
import { User } from "@/src/core/entities";
import type { TUserEntity } from "@/src/core/types";
import { Logger, Result, to } from "@/src/core/utils";
import type { IUserRepository } from "../interfaces";

export function UserRepository(client: PrismaClient): IUserRepository {
  const logger = Logger(UserRepository.name);

  const create = async (user: User) => {
    const [result, error] = await to(
      client.user.create({
        data: {
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          password: user.password,
          role: user.role as never,
          image: user.image,
        },
      }),
    );

    if (error) {
      logger.log({ error });
      return Result.failure(
        new Error(error?.message || "Error creando el usuario"),
      );
    }

    const data = User.fromEntity(result as unknown as TUserEntity);

    return Result.success(data);
  };

  const findByEmail = async (email: string) => {
    const [result, error] = await to(
      client.user.findUnique({ where: { email } }),
    );

    if (error) {
      logger.log({ error });
      return Result.failure(
        new Error(error?.message || "Error filtrando el usuario"),
      );
    }

    const data = User.fromEntity(result as unknown as TUserEntity);

    return Result.success(data);
  }

  const findByTenant = async (tenant: string) => {
    const [result, error] = await to(
      client.user.findMany({}),
    );

    if (error) {
      logger.log({ error });
      return Result.failure(
        new Error(error?.message || "Error consultando los usuarios"),
      );
    }

    const data = result.map((u) => User.fromEntity(u as TUserEntity));

    return Result.success(data);
  };

  const changeRole = async (userId: string, role: string) => {
    const [data, error] = await to(
      client.user.update({
        where: { id: userId },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: { role: role as any }
      }),
    );

    if (error) {
      logger.log({ error });
      return Result.failure(
        new Error(error?.message || "Error actualizando el usuario"),
      );
    }

    return Result.success(User.fromEntity(data as TUserEntity));
  }

  return {
    create,
    findByEmail,
    findByTenant,
    changeRole,
  };
}
