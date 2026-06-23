import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn('bg-card rounded-2xl border border-border shadow-sm', className)}>
      {children}
    </div>
  )
}

export default Card
