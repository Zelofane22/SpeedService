import * as React from 'react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  icon?: React.ReactNode
  color?: string
}

export function StatCard({ title, value, icon, color = 'bg-white' }: StatCardProps) {
  return (
    <div className={cn('rounded-2xl border border-brand-border shadow-sm p-6 flex items-start gap-4', color)}>
      {icon && (
        <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
        <p className="mt-1 text-2xl font-bold text-brand-foreground">{value}</p>
      </div>
    </div>
  )
}
