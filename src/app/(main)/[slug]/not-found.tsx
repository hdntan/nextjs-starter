import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h2 className="text-xl font-semibold">Not Found</h2>
      <p className="text-muted-foreground">The item you are looking for does not exist.</p>
      <Link href="/" className="text-primary hover:underline">
        Go home
      </Link>
    </div>
  )
}
