'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Lock, Package, Bike } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, password }),
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

        {/* Hero dark card */}
        <div className="bg-[#1D1D1F] rounded-3xl p-8 flex flex-col items-center gap-4">
          <div className="bg-[#2C2C2E] rounded-2xl p-4">
            <Bike className="text-white w-8 h-8" />
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="bg-[#861D6D] rounded-lg p-1.5">
                <Package className="text-white w-5 h-5" />
              </div>
              <span className="text-white text-xl font-bold">
                Speed<span className="text-[#B24799]">Service</span>
              </span>
            </div>

            <span className="bg-[#861D6D] text-white text-xs font-bold tracking-widest px-4 py-1.5 rounded-full uppercase">
              Espace Livreur
            </span>

            <p className="text-gray-400 text-sm text-center mt-1">
              Connectez-vous pour accéder à vos missions
            </p>
          </div>
        </div>

        {/* Login form card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h1 className="text-xl font-bold text-[#1D1D1F] mb-5">Connexion livreur</h1>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#1D1D1F]">Adresse email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#861D6D] w-4 h-4" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#F9F0F8] rounded-xl pl-10 pr-4 py-3 text-sm text-[#1D1D1F] placeholder:text-[#C9A8C3] focus:outline-none focus:ring-2 focus:ring-[#861D6D]"
                  placeholder="livreur@speedservice.bj"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#1D1D1F]">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#861D6D] w-4 h-4" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#F9F0F8] rounded-xl pl-10 pr-4 py-3 text-sm text-[#1D1D1F] placeholder:text-[#C9A8C3] focus:outline-none focus:ring-2 focus:ring-[#861D6D]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1D1D1F] disabled:bg-gray-300 text-white py-4 rounded-xl font-semibold text-sm mt-2"
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
