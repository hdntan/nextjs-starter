import { z } from 'zod'

const envSchema = z.object({
  API_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url(),
})

export const env = envSchema.parse({
  API_URL: process.env.API_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
})
