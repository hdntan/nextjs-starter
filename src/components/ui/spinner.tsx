interface SpinnerProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
}

export function Spinner({ className, size = 'md' }: SpinnerProps) {
  return (
    <div className="flex items-center justify-center p-8">
      <div
        className={`animate-spin rounded-full border-2 border-muted border-t-primary ${sizeClasses[size]} ${className ?? ''}`}
      />
    </div>
  )
}
