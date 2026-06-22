'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { User, LogOut } from 'lucide-react'
import { Logo } from '@/components/logo'
import { apiPost, apiGet } from '@/lib/api'
import { AuthContext, type AuthUser } from '@/lib/auth-context'

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

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <div className="min-h-screen bg-brand-background">
        <header className="bg-white border-b border-brand-border sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
            <Logo size="md" />
            <nav className="flex items-center gap-6">
              <Link
                href="/profile"
                className={[
                  'flex items-center gap-1.5 text-sm font-medium transition-colors',
                  pathname === '/profile'
                    ? 'text-primary'
                    : 'text-primary-400 hover:text-primary',
                ].join(' ')}
              >
                <User size={16} />
                Mon profil
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm font-medium text-primary-400 hover:text-red-500 transition-colors"
              >
                <LogOut size={16} />
                Déconnexion
              </button>
            </nav>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-6 py-10">{children}</main>
      </div>
    </AuthContext.Provider>
  )
}
