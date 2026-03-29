'use client'

import { Button } from '@/components/ui/button'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground text-center max-w-md">
        {error.message || 'An unexpected error occurred.'}
      </p>
      <Button onClick={reset} variant="outline">
        Try again
      </Button>
    </div>
  )
}
