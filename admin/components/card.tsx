import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div className={cn('bg-card rounded-2xl border border-border shadow-sm', className)} {...props}>
      {children}
    </div>
  )
}

export default Card
