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
  ClipboardList,
  Settings,
  LogOut,
  User,
  X,
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
  { href: '/drivers', icon: Truck, label: 'Livreurs', exact: false },
  { href: '/payments', icon: CreditCard, label: 'Paiements', exact: false },
  { href: '/driver-applications', icon: ClipboardList, label: 'Candidatures', exact: false },
  { href: '/settings', icon: Settings, label: 'Paramètres', exact: false },
]

interface UserInfo {
  name: string
  email: string
}

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
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

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  function isActive(link: NavLink): boolean {
    if (link.exact) return pathname === link.href
    return pathname.startsWith(link.href)
  }

  function handleLogout() {
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    router.push('/login')
    onClose?.()
  }

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden',
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 max-w-full flex-col bg-card border-r border-border h-screen overflow-y-auto shadow-2xl transition-transform lg:static lg:translate-x-0 lg:flex lg:w-60',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="lg:hidden flex items-center justify-between p-6 border-b border-border">
          <span className="text-xl font-extrabold text-primary">SpeedService</span>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-muted-foreground transition hover:bg-muted/50 hover:text-foreground"
            onClick={onClose}
            aria-label="Fermer le menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="hidden lg:block p-6 border-b border-border">
          <span className="text-xl font-extrabold text-primary">SpeedService</span>
          <div className="mt-2">
            <span className="px-3 py-1.5 bg-primary/10 rounded-xl inline-block">
              <span className="text-xs font-semibold text-primary">Administration</span>
            </span>
          </div>
        </div>

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
                onClick={onClose}
              >
                <Icon size={16} />
                {link.label}
              </Link>
            )
          })}
        </nav>

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
    </>
  )
}
