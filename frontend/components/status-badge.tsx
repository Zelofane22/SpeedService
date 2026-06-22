import { cn } from '@/lib/utils'

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  'Brouillon':                { bg: 'bg-gray-100',   text: 'text-gray-600',   dot: 'bg-gray-400' },
  'En attente de paiement':   { bg: 'bg-gray-100',   text: 'text-gray-600',   dot: 'bg-gray-400' },
  'En attente de validation': { bg: 'bg-purple-50',  text: 'text-purple-700', dot: 'bg-purple-400' },
  'Confirmée':                { bg: 'bg-blue-50',    text: 'text-blue-700',   dot: 'bg-blue-500' },
  'Assignée':                 { bg: 'bg-blue-50',    text: 'text-blue-700',   dot: 'bg-blue-400' },
  'En cours de récupération': { bg: 'bg-amber-50',   text: 'text-amber-700',  dot: 'bg-amber-400' },
  'En livraison':             { bg: 'bg-amber-50',   text: 'text-amber-700',  dot: 'bg-amber-500' },
  'Livrée':                   { bg: 'bg-green-50',   text: 'text-green-700',  dot: 'bg-green-500' },
  'Annulée':                  { bg: 'bg-red-50',     text: 'text-red-700',    dot: 'bg-red-500' },
}

export function StatusBadge({ status }: { status: string }) {
  const c = statusConfig[status] ?? { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-400' }
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold', c.bg, c.text)}>
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', c.dot)} />
      {status}
    </span>
  )
}
