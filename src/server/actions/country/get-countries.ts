'use server';

import type { TCountry } from "@/src/core/types";
import { countryRepository } from "../../providers";

export async function getCountries(): Promise<TCountry[]> {
  const result = await countryRepository.list();

  if (!result.isOk) {
    return [];
  }

  return result.data;
}
