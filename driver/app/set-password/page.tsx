'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getApiBaseUrl } from '@speedservice/api-client'

const API_URL = getApiBaseUrl()

function SetPasswordForm() {
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get('token') ?? ''
  const email = params.get('email') ?? ''

  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!token || !email) setError('Lien invalide ou expiré.')
  }, [token, email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmation) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ token, email, password, password_confirmation: confirmation }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? 'Une erreur est survenue.')
      setDone(true)
      setTimeout(() => router.push('/login'), 2000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7FB] flex flex-col">
      <header className="bg-[#861D6D] text-white px-5 py-4">
        <span className="font-semibold">SpeedService — Livreur</span>
      </header>

      <div className="flex-1 flex flex-col justify-center px-6 py-10 gap-6 max-w-md mx-auto w-full">
        <div>
          <h1 className="text-2xl font-bold text-[#1D1D1F]">Créer mon mot de passe</h1>
          <p className="text-sm text-gray-500 mt-1">Choisissez un mot de passe pour accéder à votre espace livreur.</p>
        </div>

        {done ? (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 text-sm text-center">
            Mot de passe créé ! Redirection vers la connexion…
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">{error}</div>
            )}

            <div>
              <label htmlFor="new-driver-password" className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
              <input
                id="new-driver-password"
                name="new-password"
                type="password"
                required
                minLength={8}
                maxLength={72}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#861D6D]"
                placeholder="8 caractères minimum"
              />
            </div>

            <div>
              <label htmlFor="new-driver-password-confirmation" className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
              <input
                id="new-driver-password-confirmation"
                name="new-password-confirmation"
                type="password"
                required
                minLength={8}
                maxLength={72}
                autoComplete="new-password"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#861D6D]"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !token || !email}
              aria-busy={loading}
              className="w-full bg-[#861D6D] disabled:bg-gray-300 text-white py-4 rounded-xl font-semibold text-lg"
            >
              {loading ? 'Enregistrement…' : 'Confirmer'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default function SetPasswordPage() {
  return (
    <Suspense>
      <SetPasswordForm />
    </Suspense>
  )
}
