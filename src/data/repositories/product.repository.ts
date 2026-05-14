import { prismaDbClient } from "@/src/config/database/prisma-client";

export class ProductRepository {
  readonly #client = prismaDbClient.product;

  async listProducts() {
    return this.#client.findMany({
      include: {
        productImages: {
          take: 2,
        },
      }
    });
  }
}
