import { Package } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: { text: 'text-lg', icon: 'w-7 h-7', iconSize: 14 },
  md: { text: 'text-xl', icon: 'w-8 h-8', iconSize: 16 },
  lg: { text: 'text-2xl', icon: 'w-10 h-10', iconSize: 20 },
}

export function Logo({ size = 'md', className }: LogoProps) {
  const s = sizeMap[size]
  return (
    <div className={cn('flex items-center gap-2 font-bold', s.text, className)}>
      <div className={cn('rounded-xl bg-primary flex items-center justify-center', s.icon)}>
        <Package size={s.iconSize} className="text-white" />
      </div>
      <span className="text-brand-foreground">
        Speed<span className="text-primary">Service</span>
      </span>
    </div>
  )
}
