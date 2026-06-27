'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { getApiBaseUrl } from '@speedservice/api-client'

const API_URL = getApiBaseUrl()

export default function ChangePasswordPage() {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    if (password !== passwordConfirmation) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('auth_token') ?? ''

      const response = await fetch(`${API_URL}/profile/change-password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          password,
          password_confirmation: passwordConfirmation,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setError(
          (data as { message?: string }).message ??
            'Une erreur est survenue. Veuillez réessayer.'
        )
        return
      }

      // Clear the forced-change flag
      document.cookie = 'must_change_password=; path=/; max-age=0'

      router.push('/')
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-sm w-full bg-card rounded-2xl border border-border shadow-xl p-8">
        <div className="text-center">
          <span className="text-2xl font-extrabold text-primary">SpeedService</span>
          <div className="mt-2">
            <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-xl inline-block">
              Administration
            </span>
          </div>
        </div>

        <h1 className="text-xl font-bold mt-6 mb-1">Changez votre mot de passe</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Pour des raisons de sécurité, vous devez définir un nouveau mot de passe avant de continuer.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="current_password" className="block text-sm font-medium mb-1.5">
              Mot de passe actuel
            </label>
            <input
              id="current_password"
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-input-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1.5">
              Nouveau mot de passe
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-input-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>

          <div>
            <label htmlFor="password_confirmation" className="block text-sm font-medium mb-1.5">
              Confirmer le nouveau mot de passe
            </label>
            <input
              id="password_confirmation"
              type="password"
              required
              minLength={8}
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-input-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white rounded-xl py-3 font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Enregistrement...' : 'Définir le nouveau mot de passe'}
          </button>
        </form>
      </div>
    </div>
  )
}
