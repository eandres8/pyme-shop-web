import { CategoryRepository, ProductRepository, UserRepository } from '../repositories';

import { prismaDbClient } from '@/src/config/database/prisma-client';

export const userRepository = UserRepository(prismaDbClient);
export const productRepository = new ProductRepository(prismaDbClient);
export const categoryRepository = CategoryRepository(prismaDbClient);
