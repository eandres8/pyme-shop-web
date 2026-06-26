import { z } from 'zod';

type TEnvs = {
  NODE_ENV: string;
  API_KEY_SEED: string;
  BACKLIST_KEY_WORDS: string[];
  DATABASE_URL: string;
  AUTH_SECRET: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
};

const envsSchema = z.object({
  NODE_ENV: z.string(),
  API_KEY_SEED: z.string(),
  BACKLIST_KEY_WORDS: z.array(z.string()),
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
