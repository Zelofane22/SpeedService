'use client'

import { useState } from 'react'
import Link from 'next/link'

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
      window.location.href = '/dashboard'
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7FB] flex flex-col">
      <header className="bg-[#861D6D] text-white px-5 py-4">
        <span className="font-semibold">SpeedService Driver</span>
      </header>

      <div className="flex-1 flex flex-col justify-center px-6 py-10 gap-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1D1D1F]">Connexion</h1>
          <p className="text-sm text-gray-500 mt-1">Accédez à votre espace livreur</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#861D6D]" placeholder="votre@email.com" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#861D6D]" placeholder="••••••••" />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-[#861D6D] disabled:bg-gray-300 text-white py-4 rounded-xl font-semibold text-lg">
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Pas encore livreur ?{' '}
          <Link href="/apply" className="text-[#861D6D] font-medium">Candidater →</Link>
        </p>
      </div>
    </div>
  )
}
