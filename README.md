# PymeShop

## Getting Started

First run docker container

```bash
docker compose -f docker-compose.dev.yml up --build

```

Second, run the development server:

```bash
npm run start:dev
# or
yarn start:dev
# or
pnpm start:dev
# or
bun start:dev
```

You can run migrations from prisma just like this:

```bash
docker exec -it postgres_pyme_shop_db_dev psql -U postgres -c "CREATE DATABASE 'pyme-shop';"

pnpm dlx prisma migrate dev
```

For create a new migration use:

```bash
pnpm dlx prisma migrate dev --name [migration_name]

# Create prisma models from database previous created
npx prisma pull
```

For create a Prisma Client:

https://www.prisma.io/docs/prisma-orm/quickstart/prisma-postgres

```bash
npx prisma generate
```