/**
 * Checks if a JWT is expired by decoding the payload without signature verification.
 *
 * Safe in the BFF context because the token always originates from our own
 * HttpOnly cookie — we trust the source, we just need the `exp` claim.
 * No npm package needed: pure base64url decode.
 */
export function isTokenExpired(token: string): boolean {
  try {
    const [, rawPayload] = token.split('.')
    if (!rawPayload) return true

    // JWT uses base64url; atob() requires standard base64
    const base64 = rawPayload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const decoded = JSON.parse(atob(padded)) as { exp?: number }

    if (typeof decoded.exp !== 'number') return false // no exp claim = non-expiring
    return decoded.exp * 1000 < Date.now()
  } catch {
    return true // malformed token → treat as expired
  }
}
