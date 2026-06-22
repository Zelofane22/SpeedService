'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  Users,
  Package,
  Truck,
  BarChart2,
  LogOut,
  Menu,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { apiPost } from '@/lib/api'
import type { AuthUser } from '@/lib/auth-context'

const navLinks = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { href: '/admin/users', icon: Users, label: 'Utilisateurs', exact: false },
  { href: '/admin/deliveries', icon: Package, label: 'Livraisons', exact: false },
  { href: '/admin/drivers', icon: Truck, label: 'Livreurs', exact: false },
  { href: '/admin/reports', icon: BarChart2, label: 'Rapports', exact: false },
]

function isActive(href: string, pathname: string, exact: boolean): boolean {
  return exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const stored = localStorage.getItem('user')

    if (!token) {
      router.replace('/login')
      return
    }

    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AuthUser
        if (parsed.role !== 'admin') {
          router.replace('/dashboard')
          return
        }
        setUser(parsed)
        return
      } catch {
        // fall through to fetch
      }
    }

    // Fallback: fetch from API to verify role
    import('@/lib/api').then(({ apiGet }) => {
      apiGet<AuthUser>('/profile')
        .then((u) => {
          if (u.role !== 'admin') {
            router.replace('/dashboard')
            return
          }
          localStorage.setItem('user', JSON.stringify(u))
          setUser(u)
        })
        .catch(() => {
          localStorage.removeItem('auth_token')
          router.replace('/login')
        })
    })
  }, [router])

  async function handleLogout() {
    try {
      await apiPost('/auth/logout', {}, true)
    } finally {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      router.replace('/login')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-brand-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  const SidebarContent = () => (
    <>
      {/* Logo / Title */}
      <div className="px-6 py-5 border-b border-white/20">
        <span className="text-white font-bold text-lg tracking-tight">SpeedService Admin</span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navLinks.map(({ href, icon: Icon, label, exact }) => {
          const active = isActive(href, pathname, exact)
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all',
                active
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'text-white/75 hover:text-white hover:bg-white/10',
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User + logout */}
      <div className="p-3 border-t border-white/20 space-y-1">
        <div className="px-4 py-2">
          <p className="text-xs text-white/60 font-medium uppercase tracking-wider">Connecté en tant que</p>
          <p className="text-sm text-white font-semibold truncate mt-0.5">{user.name}</p>
          <p className="text-xs text-white/60 truncate">{user.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-white/75 hover:text-white hover:bg-white/10 transition-all"
        >
          <LogOut size={18} />
          Déconnexion
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-brand-background flex font-sans">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col min-h-screen sticky top-0 h-screen bg-[#861D6D]">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-[#861D6D] transition-transform duration-300 lg:hidden',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <SidebarContent />
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Top header */}
        <header className="h-16 bg-white border-b border-brand-border flex items-center justify-between px-4 lg:px-6 shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {/* Hamburger (mobile) */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label="Ouvrir le menu"
            >
              <Menu size={20} />
            </button>
            <span className="text-lg font-bold text-brand-foreground">SpeedService Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-gray-600">{user.name}</span>
            <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold text-sm uppercase select-none">
              {user.name.charAt(0)}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
