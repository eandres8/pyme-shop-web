import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../../prisma/generated/prisma/client.js";
import { initialUsersData, defaultCategories } from "../../../prisma/seed/seed.js";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting seed...');

  // Seed categories (global categories without tenant_id)
  console.log('Seeding categories...');
  for (const categoryName of defaultCategories) {
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: categoryName,
        tenant_id: null,
      },
    });

    if (!existingCategory) {
      await prisma.category.create({
        data: {
          name: categoryName,
          tenant_id: null,
        },
      });
    }
  }
  console.log(`Seeded ${defaultCategories.length} categories`);

  // Seed users
  console.log('Seeding users...');
  for (const user of initialUsersData) {
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!existingUser) {
      await prisma.user.create({
        data: {
          email: user.email,
          name: user.name,
          password: user.password,
          role: user.role,
        },
      });
    }
  }
  console.log(`Seeded ${initialUsersData.length} users`);

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });