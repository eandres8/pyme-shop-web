import { prismaDbClient } from "@/src/config/database/prisma-client";
import { Category, Product } from "@/src/core/entities";
import { Logger } from "@/src/data/core";
import {
  CategoryRepository,
  ProductRepository,
  SeedRepository,
} from "@/src/data/server/repositories";
import { initialData } from "@/src/data/server/seed/seed";

const productRepository = new ProductRepository(prismaDbClient);
const categoryRepository = CategoryRepository(prismaDbClient);
const seedRepository = SeedRepository(prismaDbClient);

export class PopulateProducts {
  readonly logger = Logger("PopulateProducts");

  async populate() {
    await seedRepository.resetTables();

    const resultCategory = await categoryRepository.createCategories([
      "Pants",
      "Shirts",
      "Hoodies",
      "Hats",
    ]);

    if (!resultCategory.isOk) {
      throw resultCategory.getError();
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
      throw result.getError();
    }

    return result.data();
  }

  async getCategories() {
    const result = await categoryRepository.listCategories();

    if (!result.isOk) {
      throw result.getError();
    }

    const entries: Array<[name: string, id: string]> = result
      .data<Category[]>()
      .map((c) => [c.name.toLocaleLowerCase(), c.id]);

    return new Map(entries);
  }
}
