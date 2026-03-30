// DEV ONLY: bypasses auth guards in middleware and client fetch redirect.
// Enable by setting NEXT_PUBLIC_AUTH_BYPASS=true in .env.local (gitignored — never commits).
// Never set this in .env.production or any environment-level env file.
export const AUTH_BYPASS = process.env.NEXT_PUBLIC_AUTH_BYPASS === 'true'
