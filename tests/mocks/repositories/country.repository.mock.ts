import { Result } from "@/src/core/utils";
import type { TCountry } from "@/src/core/types";
import type { ICountryRepository } from "@/src/server/interfaces";

type MockOverrides = {
  createMultiple?: (countries: TCountry[]) => ReturnType<ICountryRepository["createMultiple"]>;
  list?: () => ReturnType<ICountryRepository["list"]>;
};

export function MockCountryRepository(overrides: MockOverrides = {}): ICountryRepository {
  return {
    createMultiple: overrides.createMultiple ?? (async () => Result.success(0)),
    list: overrides.list ?? (async () => Result.success([])),
  };
}
