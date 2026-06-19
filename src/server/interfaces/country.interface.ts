import type { TCountry } from "@/src/core/types";
import { Result } from "@/src/core/utils";

export interface ICountryRepository {
  createMultiple(countries: TCountry[]): Promise<Result<number>>;
  list(): Promise<Result<TCountry[]>>;
}
