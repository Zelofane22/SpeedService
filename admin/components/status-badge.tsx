import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: string
  className?: string
}

const deliveryStatusMap: Record<string, { label: string; classes: string }> = {
  Draft: {
    label: 'Brouillon',
    classes: 'bg-gray-100 text-gray-600',
  },
  AwaitingPayment: {
    label: 'En attente de paiement',
    classes: 'bg-gray-100 text-gray-600',
  },
  AwaitingValidation: {
    label: 'En attente de validation',
    classes: 'bg-purple-100 text-purple-700',
  },
  Confirmed: {
    label: 'Confirmée',
    classes: 'bg-blue-100 text-blue-700',
  },
  Assigned: {
    label: 'Assignée',
    classes: 'bg-blue-100 text-blue-700',
  },
  PickingUp: {
    label: 'En cours de récupération',
    classes: 'bg-amber-100 text-amber-700',
  },
  InDelivery: {
    label: 'En livraison',
    classes: 'bg-amber-100 text-amber-700',
  },
  Delivered: {
    label: 'Livrée',
    classes: 'bg-green-100 text-green-700',
  },
  Cancelled: {
    label: 'Annulée',
    classes: 'bg-red-100 text-red-600',
  },
  // Payment statuses
  success: {
    label: 'Réussi',
    classes: 'bg-green-100 text-green-700',
  },
  pending: {
    label: 'En attente',
    classes: 'bg-amber-100 text-amber-700',
  },
  failed: {
    label: 'Échoué',
    classes: 'bg-red-100 text-red-600',
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = deliveryStatusMap[status] ?? {
    label: status,
    classes: 'bg-gray-100 text-gray-600',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap',
        config.classes,
        className
      )}
    >
      {config.label}
    </span>
  )
}

export default StatusBadge
