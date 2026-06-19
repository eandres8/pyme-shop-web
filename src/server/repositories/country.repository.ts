import { PrismaClient } from "@/prisma/generated/prisma/client";
import { Logger, Result, to } from "@/src/core/utils";
import type { TCountry } from "@/src/core/types";
import type { ICountryRepository } from "../interfaces";

export function CountryRepository(client: PrismaClient): ICountryRepository {
  const logger = Logger(CountryRepository.name);

  const createMultiple = async (countries: TCountry[]) => {
    const operations = countries.map((c) => {
      return client.country.create({
        data: {
          id: c.id,
          name: c.name,
        },
      });
    });

    const [data, error] = await to(client.$transaction(operations));

    if (error) {
      logger.log({ error });
      return Result.failure(
        new Error(error?.message || "Error insertando los paises"),
      );
    }

    return Result.success(data.length);
  }

  const list = async () => {
    const [data, error] = await to(client.country.findMany({
      orderBy: {
        name: 'asc',
      }
    }));

    if (error) {
      logger.log({ error });
      return Result.failure(
        new Error(error?.message || "Error consultando los paises"),
      );
    }

    return Result.success(data);
  }

  return {
    createMultiple,
    list,
  };
}