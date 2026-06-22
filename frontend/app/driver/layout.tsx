'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Bike, History, LogOut, User, Bell } from 'lucide-react'
import { Logo } from '@/components/logo'
import { apiPost, apiGet } from '@/lib/api'
import { AuthContext, type AuthUser } from '@/lib/auth-context'

const navLinks = [
  { href: '/driver/missions', icon: Bike,    label: 'Missions disponibles' },
  { href: '/driver/active',   icon: Bike,    label: 'Mission en cours' },
  { href: '/driver/history',  icon: History, label: 'Historique' },
]

const pageTitles: Record<string, string> = {
  '/driver/missions': 'Missions disponibles',
  '/driver/active':   'Mission en cours',
  '/driver/history':  'Historique des missions',
}

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (!token) { router.replace('/driver-login'); return }

    apiGet<AuthUser>('/profile').then((u) => {
      if (u.role !== 'driver') { router.replace('/dashboard'); return }
      setUser(u)
    }).catch(() => {
      localStorage.removeItem('auth_token')
      router.replace('/driver-login')
    })
  }, [router])

  async function handleLogout() {
    try { await apiPost('/auth/logout', {}, true) } finally {
      localStorage.removeItem('auth_token')
      router.replace('/driver-login')
    }
  }

  if (!user) return null

  const title = pageTitles[pathname] ?? 'Espace livreur'

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <div className="min-h-screen bg-brand-background flex">
        <aside className="w-64 shrink-0 bg-white border-r border-brand-border flex flex-col min-h-screen sticky top-0 h-screen">
          <div className="p-6 border-b border-brand-border">
            <Logo size="md" />
            <p className="text-xs text-gray-700 mt-1">Espace livreur</p>
          </div>
          <nav className="p-3 flex-1 space-y-1">
            {navLinks.map(({ href, icon: Icon, label }) => {
              const isActive = pathname === href
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

        <div className="flex-1 flex flex-col min-h-screen">
          <header className="h-16 bg-white border-b border-brand-border flex items-center justify-between px-6 shrink-0 sticky top-0 z-10">
            <h1 className="text-lg font-bold text-brand-foreground">{title}</h1>
            <div className="flex items-center gap-3">
              <button className="w-9 h-9 rounded-xl bg-brand-muted flex items-center justify-center hover:bg-primary/10 transition-colors">
                <Bell size={16} className="text-gray-700" />
              </button>
              <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
                <User size={16} className="text-primary" />
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </AuthContext.Provider>
  )
}
