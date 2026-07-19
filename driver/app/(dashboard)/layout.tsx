'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { ClipboardList, LogOut, MapPinned, PackageCheck, Settings } from 'lucide-react'
import { apiGet, apiPost, type DriverUser } from '@/lib/api-client'

const NAV = [
  { href: '/missions',  label: 'Missions',   icon: PackageCheck },
  { href: '/active',    label: 'En cours',   icon: MapPinned },
  { href: '/history',   label: 'Historique', icon: ClipboardList },
  { href: '/settings',  label: 'Paramètres', icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<DriverUser | null>(null)

  useEffect(() => {
    const current = NAV.find((item) => pathname === item.href || pathname.startsWith(item.href + '/'))
    document.title = current ? `${current.label} · SpeedService Driver` : 'Espace livreur · SpeedService Driver'
  }, [pathname])

  useEffect(() => {
    const t = localStorage.getItem('driver_token')
    if (!t) { router.replace('/login'); return }

    apiGet<DriverUser>('/profile')
      .then((u) => {
        if (u.role !== 'driver') { router.replace('/login'); return }
        setUser(u)
      })
      .catch(() => {
        localStorage.removeItem('driver_token')
        router.replace('/login')
      })
  }, [router])

  async function logout() {
    try { await apiPost('/auth/logout', {}) } finally {
      localStorage.removeItem('driver_token')
      router.replace('/login')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7FB] [.dark_&]:bg-[#101114]">
        <div className="w-8 h-8 border-4 border-[#861D6D] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF7FB] text-[#1D1D1F] flex flex-col [.dark_&]:bg-[#101114] [.dark_&]:text-gray-100">
      {/* Top bar */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[#6d1858] bg-[#861D6D] px-5 py-4 text-white shadow-sm shadow-[#861D6D]/15 dark:border-[#2a2430] dark:bg-[#15161b] dark:shadow-black/30">
        <div>
          <p className="font-semibold text-sm leading-none">SpeedService Driver</p>
          <p className="text-white/70 text-xs mt-0.5 dark:text-[#b9adba]">{user.name}</p>
        </div>
        <button
          onClick={logout}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-white/30 px-3 py-1.5 text-xs text-white/80 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 dark:border-[#39313d] dark:bg-[#202128] dark:text-gray-200"
        >
          <LogOut size={14} aria-hidden="true" />
          <span>Déconnexion</span>
        </button>
      </header>

      {/* Page content — leave room for bottom nav */}
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 inset-x-0 z-10 flex border-t border-gray-200 bg-white shadow-sm dark:border-[#2a2430] dark:bg-[#15161b] dark:shadow-black/30">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`relative flex min-h-[64px] flex-1 flex-col items-center justify-center gap-1 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#861D6D]/40 ${
                active
                  ? 'text-[#861D6D] dark:text-[#f0a8df]'
                  : 'text-gray-400 hover:text-gray-600 dark:text-[#8d7f8f] dark:hover:text-gray-200'
              }`}
            >
              <Icon size={21} strokeWidth={active ? 2.4 : 2} aria-hidden="true" />
              <span className="text-xs font-medium">{label}</span>
              {active && <span className="absolute bottom-0 h-0.5 w-8 rounded-full bg-[#861D6D] dark:bg-[#f0a8df]" />}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
