import "dotenv/config";
import { env } from "prisma/config";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/prisma/generated/prisma/client";

const connectionString = env('DATABASE_URL');
const adapter = new PrismaPg({ connectionString });
export const prismaDbClient = new PrismaClient({ adapter });

export { createTenantClient } from './prisma-tenant-client';

