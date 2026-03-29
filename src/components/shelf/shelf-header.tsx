import Link from 'next/link'

interface ShelfHeaderProps {
  title: string
  cta?: { label: string; href: string }
}

export function ShelfHeader({ title, cta }: ShelfHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      {cta && (
        <Link href={cta.href} className="text-sm text-primary hover:underline">
          {cta.label}
        </Link>
      )}
    </div>
  )
}
