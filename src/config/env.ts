import { z } from 'zod'

const envSchema = z.object({
  API_URL: z
    .string()
    .url()
    .transform((url) => url.replace(/\/$/, '')),
})

const result = envSchema.safeParse({
  API_URL: process.env.API_URL,
})

if (!result.success) {
  const missing = Object.entries(result.error.flatten().fieldErrors)
    .map(([key, errors]) => `  ${key}: ${errors?.join(', ')}`)
    .join('\n')
  throw new Error(`Missing or invalid environment variables:\n${missing}`)
}

export const env = result.data
