'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, PlusCircle, History, User, LogOut, Settings } from 'lucide-react'
import { Logo } from '@/components/logo'
import { apiPost, apiGet } from '@/lib/api'
import { AuthContext, type AuthUser } from '@/lib/auth-context'
import { NotificationBell } from '@/components/notification-bell'

const navLinks = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord', mobileLabel: 'Accueil' },
  { href: '/new-delivery', icon: PlusCircle, label: 'Nouvelle livraison', mobileLabel: 'Créer' },
  { href: '/history', icon: History, label: 'Historique', mobileLabel: 'Historique' },
  { href: '/profile', icon: User, label: 'Mon profil', mobileLabel: 'Profil' },
  { href: '/settings', icon: Settings, label: 'Paramètres', mobileLabel: 'Réglages' },
]

const pageTitles: Record<string, string> = {
  '/dashboard': 'Tableau de bord',
  '/new-delivery': 'Nouvelle livraison',
  '/history': 'Historique',
  '/profile': 'Mon profil',
  '/settings': 'Paramètres',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      router.replace('/login')
      return
    }
    apiGet<AuthUser>('/profile').then(setUser).catch(() => {
      localStorage.removeItem('auth_token')
      router.replace('/login')
    })
  }, [router])

  async function handleLogout() {
    try {
      await apiPost('/auth/logout', {}, true)
    } finally {
      localStorage.removeItem('auth_token')
      router.replace('/login')
    }
  }

  if (!user) return null

  const title = pathname.startsWith('/deliveries/') ? 'Suivi de livraison' : (pageTitles[pathname] ?? 'Tableau de bord')
  const isNavActive = (href: string) => pathname === href || (href === '/history' && pathname.startsWith('/deliveries/'))

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <div className="min-h-screen bg-brand-background lg:flex">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 bg-white border-r border-brand-border lg:flex flex-col min-h-screen sticky top-0 h-screen">
          <div className="p-6 border-b border-brand-border">
            <Logo size="md" />
          </div>
          <nav className="p-3 flex-1 space-y-1">
            {navLinks.map(({ href, icon: Icon, label }) => {
              const isActive = isNavActive(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={[
                    'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all',
                    isActive
                      ? 'bg-primary text-white shadow-lg shadow-primary/25'
                      : 'text-gray-700 hover:text-brand-foreground hover:bg-brand-muted/50',
                  ].join(' ')}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              )
            })}
          </nav>
          <div className="p-3">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all"
            >
              <LogOut size={18} />
              Déconnexion
            </button>
          </div>
        </aside>

        {/* Main column */}
        <div className="flex-1 flex flex-col min-h-screen min-w-0 pb-20 lg:pb-0">
          <header className="h-16 bg-white border-b border-brand-border flex items-center justify-between gap-3 px-4 sm:px-6 shrink-0 sticky top-0 z-20">
            <div className="min-w-0 flex items-center gap-3">
              <Logo size="sm" className="shrink-0 lg:hidden" />
              <h1 className="truncate text-base font-bold text-brand-foreground sm:text-lg">{title}</h1>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
              <div className="w-9 h-9 shrink-0 rounded-xl bg-primary/20 flex items-center justify-center">
                <User size={16} className="text-primary" />
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>

        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-border bg-white/95 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 shadow-[0_-10px_30px_rgba(29,29,31,0.08)] backdrop-blur lg:hidden">
          <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
            {navLinks.map(({ href, icon: Icon, mobileLabel }) => {
              const isActive = isNavActive(href)
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                  className={[
                    'flex min-w-0 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold transition-all',
                    isActive ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-black hover:bg-brand-muted/70 hover:text-black',
                  ].join(' ')}
                >
                  <Icon size={19} />
                  <span className="max-w-full truncate">{mobileLabel}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </AuthContext.Provider>
  )
}
