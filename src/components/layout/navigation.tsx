'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
}

const navItems: NavItem[] = [{ label: 'Home', href: '/' }]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'rounded-md px-3 py-2 text-sm hover:bg-accent',
            pathname === item.href && 'bg-accent font-medium'
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
