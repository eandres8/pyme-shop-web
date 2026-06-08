import { PrismaClient } from "@/prisma/generated/prisma/client";
import { User } from "@/src/core/entities/user.entity";
import type { TUserEntity } from "@/src/core/types";
import { Logger, Result, to } from "@/src/core/utils";

export function UserRepository(client: PrismaClient) {
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

  return {
    create,
  }
}
