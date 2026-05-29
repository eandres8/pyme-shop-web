import { PrismaClient } from "@/prisma/generated/prisma/client";
import { Logger, Result } from "../core";

export function SeedRepository(client: PrismaClient) {
  const logger = Logger('SeedRepository');

  const resetTables = async () => {
    return Promise.all([
      client.category.deleteMany(),
      client.product.deleteMany(),
      client.productImage.deleteMany(),
    ])
      .then((res) => {
        logger.log({ res });

        return Result.success(true);
      })
      .catch((error) => {
        logger.error(error);

        return Result.failure(new Error(error.message));
      });
  };

  return {
    resetTables,
  };
}
