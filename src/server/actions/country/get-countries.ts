'use server';

import type { TCountry } from "@/src/core/types";
import { countryRepository } from "../../providers";

export const getCountries = async (): Promise<TCountry[]> => {
  const result = await countryRepository.list();

  if (!result.isOk) {
    return [];
  }

  return result.data();
}