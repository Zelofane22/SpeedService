'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail } from 'lucide-react'
import { getApiBaseUrl } from '@speedservice/api-client'
import { isValidEmail } from '../apply/validation'

const API_URL = getApiBaseUrl()

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setMessage(null)

    if (!isValidEmail(email)) {
      setError('Saisissez une adresse email valide.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message ?? 'Une erreur est survenue.')
      setMessage(data.message ?? 'Si un compte correspond à cette adresse, vous recevrez un lien de réinitialisation.')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#FAF7FB] flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm">
        <Link href="/login" className="text-sm font-medium text-[#861D6D] hover:underline">
          ← Retour à la connexion
        </Link>

        <div className="mt-6">
          <h1 className="text-xl font-bold text-[#1D1D1F]">Mot de passe oublié</h1>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            Entrez l’adresse email de votre compte livreur. Si elle existe, un lien de réinitialisation vous sera envoyé.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert" aria-live="polite">
              {error}
            </div>
          )}

          {message && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700" role="status">
              {message}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="forgot-password-email" className="text-sm font-medium text-[#1D1D1F]">Adresse email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#861D6D]" aria-hidden="true" />
              <input
                id="forgot-password-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl bg-[#F9F0F8] py-3 pl-10 pr-4 text-sm text-[#1D1D1F] placeholder:text-[#A66A9A] focus:outline-none focus:ring-2 focus:ring-[#861D6D]"
                placeholder="livreur@speedservice.bj"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="w-full rounded-xl bg-[#861D6D] py-4 text-sm font-semibold text-white disabled:bg-gray-300"
          >
            {loading ? 'Envoi…' : 'Recevoir le lien'}
          </button>
        </form>
      </div>
    </main>
  )
}

