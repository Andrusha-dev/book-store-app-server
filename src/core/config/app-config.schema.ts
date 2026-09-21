import { z } from 'zod';

export const appConfigSchema = z.object({
  //Гнучкі змінні (Можуть мати значення за змовчуванням)
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  ALLOWED_ORIGIN: z.url().default('http://localhost:5173'),
  FRONTEND_URL: z.url().default('http://localhost:5173'),
  BACKEND_URL: z.url().default('http://localhost:3000'),
  MONO_API_URL: z.url().default('https://api.monobank.ua/api'),
  ACCESS_TOKEN_SECRET: z.string().min(20).default('yourAccessTokenSecret'),
  REFRESH_TOKEN_SECRET: z.string().min(20).default('yourRefreshTokenSecret'),
  ACCESS_EXPIRES_IN: z.coerce.number().default(900), //значення в секундах
  REFRESH_EXPIRES_IN: z.coerce.number().default(1209600), //значення в секундах
  GOOGLE_CALLBACK_URL: z.string().default('http://localhost:3000/api/v1/auth/google/callback'),
  NP_API_URL: z.string().default('https://api.novaposhta.ua'),
  NP_POSTOMAT_MAX_WEIGHT_KG: z.coerce.number().default(20),
  NP_POSTOMAT_MAX_HEIGHT_SM: z.coerce.number().default(60),


  //Мають бути обовязково прописані в .env, незалежно від значення process.env.NODE_ENV
  DATABASE_URL: z.url(),
  MONO_API_TOKEN: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  NP_API_KEY: z.string(),
  NP_SENDER_CITY_REF: z.string(),
  NP_SENDER_REF: z.string(),
  NP_SENDER_WAREHOUSE_REF: z.string(),
  NP_SENDER_CONTACT_REF: z.string(),
  NP_SENDER_PHONE: z.string()
});

export type AppConfig = z.infer<typeof appConfigSchema>;


