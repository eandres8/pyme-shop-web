import {
  CategoryRepository,
  CountryRepository,
  ProductRepository,
  UserAddressRepository,
  UserRepository,
  OrderRepository,
  ProductImageRepository,
  UploadFilesRepository,
} from "../repositories";
import { prismaDbClient } from "@/src/config/database/prisma-client";

type TDepdenencies = {
  userRepository: ReturnType<typeof UserRepository>;
  productRepository: ReturnType<typeof ProductRepository>;
  categoryRepository: ReturnType<typeof CategoryRepository>;
  countryRepository: ReturnType<typeof CountryRepository>;
  userAddressRepository: ReturnType<typeof UserAddressRepository>;
  orderRepository: ReturnType<typeof OrderRepository>;
  productImageRepository: ReturnType<typeof ProductImageRepository>;
  uploadFilesRepository: ReturnType<typeof UploadFilesRepository>;
}

export function inject(dependency: keyof TDepdenencies) {
  const dependencies: TDepdenencies = {
    userRepository: UserRepository(prismaDbClient),
    productRepository: ProductRepository(prismaDbClient),
    categoryRepository: CategoryRepository(prismaDbClient),
    countryRepository: CountryRepository(prismaDbClient),
    userAddressRepository: UserAddressRepository(prismaDbClient),
    orderRepository: OrderRepository(prismaDbClient),
    productImageRepository: ProductImageRepository(prismaDbClient),
    uploadFilesRepository: UploadFilesRepository(),
  };

  return dependencies[dependency];
}
