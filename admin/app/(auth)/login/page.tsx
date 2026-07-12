'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { getApiBaseUrl } from '@speedservice/api-client'

const API_URL = getApiBaseUrl()

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setError(
          (data as { message?: string }).message ??
            'Identifiants incorrects. Veuillez réessayer.'
        )
        return
      }

      const data = (await response.json()) as {
        token?: string
        access_token?: string
        user?: { name: string; email: string; must_change_password?: boolean }
      }
      const token = data.token ?? data.access_token ?? ''

      document.cookie = `auth_token=${token}; path=/`
      localStorage.setItem('auth_token', token)

      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user))
      }

      if (data.user?.must_change_password) {
        document.cookie = 'must_change_password=1; path=/'
        router.push('/change-password')
      } else {
        router.push('/')
      }
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-sm w-full bg-card rounded-2xl border border-border shadow-xl p-8">
        {/* Logo */}
        <div className="text-center">
          <span className="text-2xl font-extrabold text-primary">SpeedService</span>
          <div className="mt-2">
            <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-xl inline-block">
              Administration
            </span>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-xl font-bold mt-6 mb-1">Connexion</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Réservé aux administrateurs
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1.5">
              Adresse e-mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@speedservice.bj"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'login-error' : undefined}
              className="min-h-11 w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1.5">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'login-error' : undefined}
              className="min-h-11 w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {error && (
            <p id="login-error" role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white rounded-xl py-3 font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}
