import { z } from 'zod';

export const appConfigSchema = z.object({
  //Гнучкі змінні (Можуть мати значення за змовчуванням)
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  ALLOWED_ORIGIN: z.url().default('http://localhost:5173'),
  FRONTEND_URL: z.url().default('http://localhost:5173'),
  MONO_API_URL: z.url().default('https://api.monobank.ua/api'),
  MONO_API_TOKEN: z.string().default('mock-token'),
  MONO_PUBLIC_KEY: z.string().default('mock-public-key'),
  ACCESS_TOKEN_SECRET: z.string().min(20).default('yourAccessTokenSecret'),
  REFRESH_TOKEN_SECRET: z.string().min(20).default('yourRefreshTokenSecret'),
  ACCESS_EXPIRES_IN: z.coerce.number().default(900), //значення в секундах
  REFRESH_EXPIRES_IN: z.coerce.number().default(1209600), //значення в секундах
  GOOGLE_CALLBACK_URL: z.string().default('http://localhost:3000/api/v1/auth/google/callback'),

  //Має бути обовязково прописана в .env, незалежно від значення process.env.NODE_ENV
  DATABASE_URL: z.url(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),

  // ... інші змінні
});

export type AppConfig = z.infer<typeof appConfigSchema>;


