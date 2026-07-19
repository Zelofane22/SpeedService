'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bike, Eye, EyeOff, Lock, Package, User } from 'lucide-react'
import { getApiBaseUrl } from '@speedservice/api-client'

const API_URL = getApiBaseUrl()

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ identifier, password }),
      })
      if (!res.ok) throw new Error('Identifiants incorrects.')
      const { token } = await res.json()
      localStorage.setItem('driver_token', token)
      window.location.href = '/missions'
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7FB] flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm flex flex-col gap-4">
        <div className="rounded-2xl border border-[#E8D7E7] bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="bg-[#861D6D] rounded-xl p-3">
              <Bike className="text-white w-7 h-7" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Package className="text-[#861D6D] w-5 h-5" aria-hidden="true" />
                <span className="text-[#1D1D1F] text-xl font-bold">
                  Speed<span className="text-[#861D6D]">Service</span> Driver
                </span>
              </div>
              <p className="text-gray-600 text-sm mt-1">
                Espace livreur
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h1 className="text-xl font-bold text-[#1D1D1F] mb-5">Connexion livreur</h1>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm" role="alert" aria-live="polite">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="driver-login-identifier" className="text-sm font-medium text-[#1D1D1F]">Email ou téléphone</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#861D6D] w-4 h-4" aria-hidden="true" />
                <input
                  id="driver-login-identifier"
                  name="username"
                  type="text"
                  required
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-[#F9F0F8] rounded-xl pl-10 pr-4 py-3 text-sm text-[#1D1D1F] placeholder:text-[#C9A8C3] focus:outline-none focus:ring-2 focus:ring-[#861D6D]"
                  placeholder="livreur@speedservice.bj ou +229 01 97 00 00 00"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="driver-login-password" className="text-sm font-medium text-[#1D1D1F]">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#861D6D] w-4 h-4" aria-hidden="true" />
                <input
                  id="driver-login-password"
                  name="current-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#F9F0F8] rounded-xl pl-10 pr-12 py-3 text-sm text-[#1D1D1F] placeholder:text-[#C9A8C3] focus:outline-none focus:ring-2 focus:ring-[#861D6D]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-[#861D6D] hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#861D6D]"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
            </div>

            <Link href="/forgot-password" className="self-end text-sm font-medium text-[#861D6D] hover:underline">
              Mot de passe oublié ?
            </Link>

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="w-full bg-[#861D6D] disabled:bg-gray-300 text-white py-4 rounded-xl font-semibold text-sm mt-2"
            >
              {loading ? 'Connexion…' : 'Accéder à mes missions'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500">
          Pas encore livreur ?{' '}
          <Link href="/apply" className="text-[#861D6D] font-medium">Candidater →</Link>
        </p>
      </div>
    </div>
  )
}
