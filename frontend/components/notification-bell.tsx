'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, CheckCheck, Package, X } from 'lucide-react'
import { apiGet, apiPatch } from '@/lib/api'
import { cn } from '@/lib/utils'

type NotificationItem = {
  id: string
  title: string
  message: string
  data: { delivery_id?: string; reference?: string } | null
  read_at: string | null
  created_at: string
}

type NotificationResponse = {
  unread_count: number
  notifications: NotificationItem[]
}

function formatRelativeDate(value: string) {
  const date = new Date(value)
  const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60_000)

  if (diffMinutes < 1) return 'À l’instant'
  if (diffMinutes < 60) return `Il y a ${diffMinutes} min`
  if (diffMinutes < 1_440) return `Il y a ${Math.floor(diffMinutes / 60)} h`

  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

export function NotificationBell() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const response = await apiGet<NotificationResponse>('/notifications')
      setItems(response.notifications)
      setUnreadCount(response.unread_count)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
    const interval = window.setInterval(() => void load(), 30_000)
    return () => window.clearInterval(interval)
  }, [load])

  async function openNotification(item: NotificationItem) {
    if (!item.read_at) {
      await apiPatch(`/notifications/${item.id}/read`, {}, true)
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, read_at: new Date().toISOString() } : entry))
      setUnreadCount((current) => Math.max(0, current - 1))
    }

    setOpen(false)
    if (item.data?.delivery_id) router.push(`/deliveries/${item.data.delivery_id}`)
  }

  async function markAllAsRead() {
    await apiPatch('/notifications/read-all', {}, true)
    const readAt = new Date().toISOString()
    setItems((current) => current.map((item) => ({ ...item, read_at: item.read_at ?? readAt })))
    setUnreadCount(0)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} non lues` : ''}`}
        className="relative w-9 h-9 rounded-xl bg-brand-muted flex items-center justify-center hover:bg-primary/10 transition-colors"
      >
        <Bell size={16} className="text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-[10px] leading-4 font-bold text-white text-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed left-4 right-4 top-20 z-50 overflow-hidden rounded-2xl border border-brand-border bg-white shadow-2xl sm:absolute sm:left-auto sm:right-0 sm:top-12 sm:w-[min(24rem,calc(100vw-2rem))]">
          <div className="flex items-center justify-between border-b border-brand-border px-4 py-3">
            <div>
              <p className="text-sm font-bold text-brand-foreground">Notifications</p>
              <p className="text-xs text-gray-500">{unreadCount} non lue{unreadCount !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button type="button" onClick={markAllAsRead} title="Tout marquer comme lu" className="p-2 text-primary hover:bg-primary/10 rounded-lg">
                  <CheckCheck size={16} />
                </button>
              )}
              <button type="button" onClick={() => setOpen(false)} aria-label="Fermer" className="p-2 text-gray-500 hover:bg-brand-muted rounded-lg">
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="max-h-[calc(100vh-10rem)] overflow-y-auto sm:max-h-96">
            {loading ? (
              <div className="flex justify-center py-10"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
            ) : items.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <Package size={28} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm text-gray-500">Aucune notification pour le moment.</p>
              </div>
            ) : items.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => void openNotification(item)}
                className={cn(
                  'w-full border-b border-brand-border px-4 py-3 text-left last:border-0 hover:bg-brand-muted/40 transition-colors',
                  !item.read_at && 'bg-primary/4',
                )}
              >
                <div className="flex gap-3">
                  <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', item.read_at ? 'bg-gray-200' : 'bg-primary')} />
                  <span className="min-w-0">
                    <span className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-brand-foreground">{item.title}</span>
                      <span className="shrink-0 text-[11px] text-gray-500">{formatRelativeDate(item.created_at)}</span>
                    </span>
                    <span className="mt-0.5 block text-xs leading-5 text-gray-600">{item.message}</span>
                    {item.data?.reference && <span className="mt-1 block text-[11px] font-mono font-semibold text-primary">{item.data.reference}</span>}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
