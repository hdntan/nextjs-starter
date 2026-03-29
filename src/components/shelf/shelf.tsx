import { ShelfHeader } from './shelf-header'
import type { ShelfVariant } from '@/types/content'
import { cn } from '@/lib/utils'

interface ShelfProps {
  variant: ShelfVariant
  title: string
  cta?: { label: string; href: string }
  className?: string
  children: React.ReactNode
}

const variantClasses: Record<ShelfVariant, string> = {
  'horizontal-scroll': 'flex overflow-x-auto gap-4 snap-x snap-mandatory pb-4',
  'grid-2': 'grid grid-cols-1 sm:grid-cols-2 gap-4',
  'grid-3': 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
  'grid-4': 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',
  hero: 'grid grid-cols-1',
}

export function Shelf({ variant, title, cta, className, children }: ShelfProps) {
  return (
    <section className={cn('mb-8', className)}>
      <ShelfHeader title={title} cta={cta} />
      <div className={variantClasses[variant]}>{children}</div>
    </section>
  )
}
