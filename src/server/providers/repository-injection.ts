import {
  CategoryRepository,
  CountryRepository,
  ProductRepository,
  UserAddressRepository,
  UserRepository,
  OrderRepository,
  ProductImageRepository,
  TenantRepository,
  UploadFilesRepository,
} from "../repositories";
import { prismaDbClient } from "@/src/config/database/prisma-client";

export const userRepository = UserRepository(prismaDbClient);
export const productRepository = ProductRepository(prismaDbClient);
export const categoryRepository = CategoryRepository(prismaDbClient);
export const countryRepository = CountryRepository(prismaDbClient);
export const userAddressRepository = UserAddressRepository(prismaDbClient);
export const orderRepository = OrderRepository(prismaDbClient);
export const productImageRepository = ProductImageRepository(prismaDbClient);
export const tenantRepository = TenantRepository(prismaDbClient);
export const uploadFilesRepository = UploadFilesRepository();
