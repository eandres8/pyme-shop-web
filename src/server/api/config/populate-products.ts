import { initialData, initialUsersData, seedCountries } from "@/prisma/seed";
import { prismaDbClient } from "@/src/config/database/prisma-client";
import { Product } from "@/src/core/entities";
import { User } from "@/src/core/entities/user.entity";
import { Logger } from "@/src/core/utils";
import { SeedRepository } from "@/src/server/repositories";
import { userRepository, categoryRepository, productRepository, countryRepository } from "../../providers";

const seedRepository = SeedRepository(prismaDbClient);

export class PopulateProducts {
  readonly logger = Logger("PopulateProducts");

  async populate() {
    await seedRepository.resetTables();

    await Promise.all([
      userRepository.create(User.fromJson(initialUsersData.at(0)!)),
      userRepository.create(User.fromJson(initialUsersData.at(1)!)),
    ])

    await countryRepository.createMultiple(seedCountries);

    const resultCategory = await categoryRepository.createCategories([
      "Pants",
      "Shirts",
      "Hoodies",
      "Hats",
    ]);

    if (!resultCategory.isOk) {
      throw resultCategory.error;
    }

    const mapCategories = await this.getCategories();

    const listProducts = initialData.products.map((p) =>
      Product.fromJson({
        description: p.description,
        images: p.images,
        in_stock: p.inStock,
        category_id: mapCategories.get(p.type),
        gender: p.gender,
        price: p.price,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sizes: p.sizes as any,
        slug: p.slug,
        title: p.title,
        tags: p.tags,
        type: p.type,
      }),
    );
    
    const result = await productRepository.createMultiple(
      listProducts.slice(0, 25),
    );

    if (result.isOk === false) {
      throw result.error;
    }

    return result.data;
  }

  async getCategories() {
    const result = await categoryRepository.listCategories();

    if (!result.isOk) {
      throw result.error;
    }

    const entries: Array<[name: string, id: string]> = result
      .data
      .map((c) => [c.name.toLocaleLowerCase(), c.id]);

    return new Map(entries);
  }
}
