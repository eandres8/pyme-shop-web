'use server';

import type { TCountry } from "@/src/core/types";
import { inject } from "../../providers";
import type { ICountryRepository } from "../../interfaces";

function getCountriesAction(countryRepository: ICountryRepository) {
  return async (): Promise<TCountry[]> => {
    const result = await countryRepository.list();

    if (!result.isOk) {
      return [];
    }

    return result.data;
  };
} 

export const getCountries = getCountriesAction(inject('countryRepository') as ICountryRepository);
