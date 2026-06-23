'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { apiGet, apiPost, type DriverUser } from '@/lib/api-client'

const NAV = [
  { href: '/missions',  label: 'Missions',   icon: '🛵' },
  { href: '/active',    label: 'En cours',   icon: '📍' },
  { href: '/history',   label: 'Historique', icon: '📋' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<DriverUser | null>(null)

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
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7FB]">
        <div className="w-8 h-8 border-4 border-[#861D6D] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF7FB] flex flex-col">
      {/* Top bar */}
      <header className="bg-[#861D6D] text-white px-5 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <p className="font-semibold text-sm leading-none">SpeedService Driver</p>
          <p className="text-white/70 text-xs mt-0.5">{user.name}</p>
        </div>
        <button onClick={logout} className="text-white/70 hover:text-white text-xs border border-white/30 rounded-lg px-3 py-1.5 transition-colors">
          Déconnexion
        </button>
      </header>

      {/* Page content — leave room for bottom nav */}
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-10 flex">
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${active ? 'text-[#861D6D]' : 'text-gray-400'}`}
            >
              <span className="text-xl leading-none">{icon}</span>
              <span className={`text-xs font-medium ${active ? 'text-[#861D6D]' : 'text-gray-400'}`}>{label}</span>
              {active && <span className="absolute bottom-0 w-8 h-0.5 bg-[#861D6D] rounded-full" />}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
