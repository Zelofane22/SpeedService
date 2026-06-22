'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  Users,
  Truck,
  CreditCard,
  LogOut,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavLink {
  href: string
  icon: React.ElementType
  label: string
  exact: boolean
}

const navLinks: NavLink[] = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { href: '/orders', icon: Package, label: 'Commandes', exact: false },
  { href: '/clients', icon: Users, label: 'Clients', exact: false },
  { href: '/couriers', icon: Truck, label: 'Livreurs', exact: false },
  { href: '/payments', icon: CreditCard, label: 'Paiements', exact: false },
]

interface UserInfo {
  name: string
  email: string
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<UserInfo>({ name: '', email: '' })

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user')
      if (stored) {
        const parsed = JSON.parse(stored) as UserInfo
        setUser(parsed)
      }
    } catch {
      // ignore parse errors
    }
  }, [])

  function isActive(link: NavLink): boolean {
    if (link.exact) return pathname === link.href
    return pathname.startsWith(link.href)
  }

  function handleLogout() {
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  return (
    <aside className="w-60 shrink-0 bg-card border-r border-border flex flex-col h-screen sticky top-0">
      {/* Logo section */}
      <div className="p-6 border-b border-border">
        <span className="text-xl font-extrabold text-primary">SpeedService</span>
        <div className="mt-2">
          <span className="px-3 py-1.5 bg-primary/10 rounded-xl inline-block">
            <span className="text-xs font-semibold text-primary">Administration</span>
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-3 flex-1 space-y-1">
        {navLinks.map((link) => {
          const Icon = link.icon
          const active = isActive(link)
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all',
                active
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <Icon size={16} />
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* User profile + logout */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/50 cursor-pointer">
          <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
            <User size={14} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate">
              {user.name || 'Administrateur'}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              {user.email || 'admin@speedservice.bj'}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
        >
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
