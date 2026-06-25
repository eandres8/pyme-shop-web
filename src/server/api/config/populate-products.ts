import { prismaDbClient } from "@/src/config/database/prisma-client";
import { Logger } from "@/src/core/utils";
import { SeedRepository } from "@/src/server/repositories";
import { categoryRepository, countryRepository } from "../../providers";

const seedRepository = SeedRepository(prismaDbClient);

export function PopulateProductsAction() {
  const logger = Logger("PopulateProducts");

  const populate = async () => {
    await seedRepository.resetTables();

    await countryRepository.createMultiple([
      { name: "Brasil", id: "BR" },
      { name: "Colombia", id: "CO" },
      { name: "Mexico", id: "MX" },
    ]);

    const resultCategory = await categoryRepository.createCategories([
      "Pantalones",
      "Camisetas",
      "Busos",
      "Gorras",
      "Zapatos",
      "Tenis",
      "Mascotas",
    ]);

    if (!resultCategory.isOk) {
      logger.error(resultCategory.error);
      throw resultCategory.error;
    }

    return resultCategory.data;
  };

  const getCategories = async () => {
    const result = await categoryRepository.listCategories();

    if (!result.isOk) {
      logger.error(result.error);
      throw result.error;
    }

    const entries: Array<[name: string, id: string]> = result.data.map((c) => [
      c.name.toLocaleLowerCase(),
      c.id,
    ]);

    return new Map(entries);
  };

  return {
    populate,
    getCategories,
  };
}

export const populateProducts = PopulateProductsAction();
