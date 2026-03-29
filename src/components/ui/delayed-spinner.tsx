'use client'

import { useEffect, useState } from 'react'
import { Spinner } from './spinner'

interface DelayedSpinnerProps {
  delay?: number
}

export function DelayedSpinner({ delay = 500 }: DelayedSpinnerProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  // Return null until delay fires — no DOM node, no layout shift
  return visible ? <Spinner /> : null
}
