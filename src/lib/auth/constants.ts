export const ACCESS_TOKEN = 'access_token'
export const REFRESH_TOKEN = 'refresh_token'

export const ACCESS_TOKEN_MAX_AGE = 60 * 15 // 15 minutes
export const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

// Shared cookie options — single source of truth; changing here updates all auth routes
const IS_PROD = process.env.NODE_ENV === 'production'

export const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: ACCESS_TOKEN_MAX_AGE,
}

export const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: REFRESH_TOKEN_MAX_AGE,
}
