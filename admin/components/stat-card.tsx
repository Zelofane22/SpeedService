import { ArrowUp, ArrowDown } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string
  change?: string
  up?: boolean
  icon: React.ElementType
  colorClass: string
  subtitle?: string
}

export function StatCard({
  label,
  value,
  change,
  up,
  icon: Icon,
  colorClass,
  subtitle,
}: StatCardProps) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}
        >
          <Icon size={18} />
        </div>
        {change !== undefined && (
          <div
            className={`flex items-center gap-1 text-xs font-semibold ${
              up ? 'text-green-600' : 'text-red-500'
            }`}
          >
            {up ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            {change}
          </div>
        )}
      </div>
      <p className="text-2xl font-extrabold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      {subtitle && (
        <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground/70 sm:text-xs">
          {subtitle}
        </p>
      )}
    </div>
  )
}

export default StatCard
