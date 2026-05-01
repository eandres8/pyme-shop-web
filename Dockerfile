# ---------- BUILD STAGE ----------
FROM node:24-alpine AS builder

WORKDIR /app

# Activar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./

# Instalar dependencias
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

# ---------- PRODUCTION STAGE ----------
FROM node:24-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./

# Solo dependencias de producción
RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src

ENV NODE_ENV=production

# Esperar DB + correr migraciones + iniciar app
CMD ["sh", "-c", "until nc -z $DB_HOST $DB_PORT; do echo waiting for db; sleep 2; done; pnpm typeorm:migration:run && node dist/main.js"]