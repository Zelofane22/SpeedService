'use client'

import { cn } from './utils'

interface Config {
  label: string
  bg: string
  text: string
  dot?: string
}

const STATUS_MAP: Record<string, Config> = {
  // snake_case (backend canonical values)
  draft:                { label: 'Brouillon',                bg: 'bg-gray-100',   text: 'text-gray-600',   dot: 'bg-gray-400' },
  awaiting_payment:     { label: 'En attente de paiement',   bg: 'bg-gray-100',   text: 'text-gray-600',   dot: 'bg-gray-400' },
  awaiting_validation:  { label: 'En attente de validation', bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-400' },
  confirmed:            { label: 'Confirmée',                bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500' },
  assigned:             { label: 'Assignée',                 bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-400' },
  picking_up:           { label: 'En cours de récupération', bg: 'bg-amber-100',  text: 'text-amber-700',  dot: 'bg-amber-400' },
  in_delivery:          { label: 'En livraison',             bg: 'bg-amber-100',  text: 'text-amber-700',  dot: 'bg-amber-500' },
  delivered:            { label: 'Livrée',                   bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500' },
  cancelled:            { label: 'Annulée',                  bg: 'bg-red-100',    text: 'text-red-700',    dot: 'bg-red-500' },
  // Payment statuses
  success:              { label: 'Réussi',                   bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500' },
  pending:              { label: 'En attente',               bg: 'bg-amber-100',  text: 'text-amber-700',  dot: 'bg-amber-400' },
  failed:               { label: 'Échoué',                   bg: 'bg-red-100',    text: 'text-red-600',    dot: 'bg-red-500' },
}

function normalize(status: string): string {
  // Convert PascalCase to snake_case for backwards compat (e.g. AwaitingPayment → awaiting_payment)
  return status.replace(/([A-Z])/g, (m, l, i) => (i === 0 ? l.toLowerCase() : '_' + l.toLowerCase()))
}

interface StatusBadgeProps {
  status: string
  showDot?: boolean
  className?: string
}

export function StatusBadge({ status, showDot = true, className }: StatusBadgeProps) {
  const key = normalize(status)
  const c = STATUS_MAP[key] ?? { label: status, bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' }
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap',
        c.bg,
        c.text,
        className
      )}
    >
      {showDot && c.dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', c.dot)} />
      )}
      {c.label}
    </span>
  )
}
