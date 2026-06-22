import { cn } from '@/lib/utils'

type BadgeConfig = { label: string; bg: string; text: string; dot: string }

const statusConfig: Record<string, BadgeConfig> = {
  draft:                { label: 'Brouillon',                bg: 'bg-gray-100',    text: 'text-gray-600',    dot: 'bg-gray-400' },
  awaiting_payment:     { label: 'Attente paiement',         bg: 'bg-yellow-50',   text: 'text-yellow-700',  dot: 'bg-yellow-400' },
  awaiting_validation:  { label: 'Attente validation',       bg: 'bg-purple-50',   text: 'text-purple-700',  dot: 'bg-purple-400' },
  confirmed:            { label: 'Confirmée',                bg: 'bg-blue-50',     text: 'text-blue-700',    dot: 'bg-blue-500' },
  assigned:             { label: 'Assignée',                 bg: 'bg-indigo-50',   text: 'text-indigo-700',  dot: 'bg-indigo-400' },
  picking_up:           { label: 'En récupération',          bg: 'bg-orange-50',   text: 'text-orange-700',  dot: 'bg-orange-400' },
  in_delivery:          { label: 'En livraison',             bg: 'bg-orange-100',  text: 'text-orange-800',  dot: 'bg-orange-500' },
  delivered:            { label: 'Livrée',                   bg: 'bg-green-50',    text: 'text-green-700',   dot: 'bg-green-500' },
  cancelled:            { label: 'Annulée',                  bg: 'bg-red-50',      text: 'text-red-700',     dot: 'bg-red-500' },
}

export function StatusBadge({ status }: { status: string }) {
  const c = statusConfig[status] ?? { label: status, bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-400' }
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold', c.bg, c.text)}>
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', c.dot)} />
      {c.label}
    </span>
  )
}
