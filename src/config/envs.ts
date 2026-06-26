import { z } from 'zod';

type TEnvs = {
  PORT: number;
  ORIGIN: string;
  NODE_ENV: string;
  NEXT_PUBLIC_HOST: string;
  BACKLIST_KEY_WORDS: string[];
  DOMAIN_LOGIN_URL: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASS: string;
  DB_NAME: string;
  DATABASE_URL: string;
  AUTH_SECRET: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
};

const envsSchema = z.object({
  PORT: z.coerce.number().transform((val) => Number(val.toFixed(0))),
  ORIGIN: z.string(),
  NODE_ENV: z.string(),
  NEXT_PUBLIC_HOST: z.string(),
  BACKLIST_KEY_WORDS: z.array(z.string()),
  DOMAIN_LOGIN_URL: z.string(),
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number().transform((val) => Number(val.toFixed(0))),
  DB_USER: z.string(),
  DB_PASS: z.string(),
  DB_NAME: z.string(),
  DATABASE_URL: z.string(),
  AUTH_SECRET: z.string(),
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
});

const envsParsed = envsSchema.safeParse({
  ...process.env,
  BACKLIST_KEY_WORDS: process.env.BACKLIST_KEY_WORDS?.split(","),
});

if (!envsParsed.success) {
  console.error('Error parsing envs', envsParsed.error);
  throw new Error('Error parsing envs');
}

export const envs = envsParsed.data as TEnvs;
