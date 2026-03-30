import { z } from 'zod'

const envSchema = z.object({
  API_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url(),
})

const result = envSchema.safeParse({
  API_URL: process.env.API_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
})

if (!result.success) {
  const missing = Object.entries(result.error.flatten().fieldErrors)
    .map(([key, errors]) => `  ${key}: ${errors?.join(', ')}`)
    .join('\n')
  throw new Error(`Missing or invalid environment variables:\n${missing}`)
}

export const env = result.data
