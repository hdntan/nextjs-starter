'use client'

// TODO: RE-ENABLE AUTH — This component shows "Guest" when auth is bypassed.
// Once auth is re-enabled, the user object will be populated normally.
import { useAuth } from '@/hooks/use-auth'

export function UserBadge() {
  const { user, isHydrated } = useAuth()

  if (!isHydrated) return null

  return (
    <span className="text-sm text-muted-foreground">
      {user ? (user.name ?? user.email) : 'Guest'}
    </span>
  )
}
