import {
  CategoryRepository,
  CountryRepository,
  ProductRepository,
  UserAddressRepository,
  UserRepository,
} from "../repositories";
import { prismaDbClient } from "@/src/config/database/prisma-client";

export const userRepository = UserRepository(prismaDbClient);
export const productRepository = new ProductRepository(prismaDbClient);
export const categoryRepository = CategoryRepository(prismaDbClient);
export const countryRepository = CountryRepository(prismaDbClient);
export const userAddressRepository = UserAddressRepository(prismaDbClient);
