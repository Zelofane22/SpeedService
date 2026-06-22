'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, PlusCircle, History, User, LogOut, Bell } from 'lucide-react'
import { Logo } from '@/components/logo'
import { apiPost, apiGet } from '@/lib/api'
import { AuthContext, type AuthUser } from '@/lib/auth-context'

const navLinks = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { href: '/new-delivery', icon: PlusCircle, label: 'Nouvelle livraison' },
  { href: '/history', icon: History, label: 'Historique' },
  { href: '/profile', icon: User, label: 'Mon profil' },
]

const pageTitles: Record<string, string> = {
  '/dashboard': 'Tableau de bord',
  '/new-delivery': 'Nouvelle livraison',
  '/history': 'Historique',
  '/profile': 'Mon profil',
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

  const title = pageTitles[pathname] ?? 'Tableau de bord'

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <div className="min-h-screen bg-brand-background flex">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 bg-white border-r border-brand-border flex flex-col min-h-screen sticky top-0 h-screen">
          <div className="p-6 border-b border-brand-border">
            <Logo size="md" />
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
                      : 'text-primary-400 hover:text-brand-foreground hover:bg-brand-muted/50',
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
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-primary-400 hover:text-red-600 hover:bg-red-50 transition-all"
            >
              <LogOut size={18} />
              Déconnexion
            </button>
          </div>
        </aside>

        {/* Main column */}
        <div className="flex-1 flex flex-col min-h-screen">
          <header className="h-16 bg-white border-b border-brand-border flex items-center justify-between px-6 shrink-0 sticky top-0 z-10">
            <h1 className="text-lg font-bold text-brand-foreground">{title}</h1>
            <div className="flex items-center gap-3">
              <button className="w-9 h-9 rounded-xl bg-brand-muted flex items-center justify-center hover:bg-primary/10 transition-colors">
                <Bell size={16} className="text-primary-400" />
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
