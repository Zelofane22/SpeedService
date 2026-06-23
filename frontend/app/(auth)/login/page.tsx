'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Bike } from 'lucide-react'
import { Logo } from '@/components/logo'
import { Input } from '@/components/input'
import { Button } from '@/components/button'
import { apiPost } from '@/lib/api'

type FieldErrors = Partial<Record<'email' | 'password', string>>

type LoginResponse = {
  user: { id: string; name: string; email: string; phone: string; role: string }
  token: string
}

export default function LoginPage() {
  const router = useRouter()

  const [form, setForm] = useState({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [globalError, setGlobalError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }))
      setFieldErrors(prev => ({ ...prev, [field]: undefined }))
      setGlobalError('')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setFieldErrors({})
    setGlobalError('')

    try {
      const data = await apiPost<LoginResponse>('/auth/login', form)
      if (data.user.role === 'admin') {
        const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL ?? 'http://localhost:3001'
        window.location.href = adminUrl
        return
      }

      if (data.user.role === 'driver') {
        const driverUrl = process.env.NEXT_PUBLIC_DRIVER_URL ?? 'http://localhost:3002'
        window.location.href = `${driverUrl}/login`
        return
      }

      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      router.push('/dashboard')
    } catch (err: unknown) {
      if (err instanceof Error && 'errors' in err) {
        const apiErrors = (err as Error & { errors?: Record<string, string[]> }).errors
        if (apiErrors) {
          const mapped: FieldErrors = {}
          for (const [key, msgs] of Object.entries(apiErrors)) {
            const k = key as keyof FieldErrors
            mapped[k] = msgs[0]
          }
          setFieldErrors(mapped)
          return
        }
      }
      setGlobalError(
        err instanceof Error ? err.message : 'Une erreur inattendue est survenue.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-10">
        <div className="flex justify-center mb-4">
          <Logo size="lg" />
        </div>
        <p className="text-sm text-gray-700">Bienvenue ! Connectez-vous à votre espace</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl border border-brand-border shadow-sm shadow-primary/5 p-8">
        <h1 className="text-xl font-bold text-brand-foreground mb-6">Connexion</h1>

        {globalError && (
          <div className="mb-5 px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-600">
            {globalError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Input
            label="Adresse email"
            type="email"
            placeholder="koffi@gmail.com"
            autoComplete="email"
            icon={Mail}
            value={form.email}
            onChange={set('email')}
            error={fieldErrors.email}
            required
          />

          <Input
            label="Mot de passe"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            icon={Lock}
            value={form.password}
            onChange={set('password')}
            error={fieldErrors.password}
            required
          />

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-primary font-semibold hover:underline">
              Mot de passe oublié ?
            </Link>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full mt-2 h-12 rounded-2xl bg-primary text-white font-semibold hover:bg-primary-800 shadow-lg shadow-primary/25 transition-all active:scale-[0.98]"
          >
            {loading ? 'Connexion en cours…' : 'Se connecter'}
          </Button>
        </form>
      </div>

      {/* Link to register */}
      <p className="text-center text-sm text-gray-700 mt-6">
        Pas encore de compte ?{' '}
        <Link href="/register" className="text-primary font-semibold hover:underline">
          Créer un compte
        </Link>
      </p>

      {/* Driver access */}
      <div className="mt-6 border-t border-brand-border pt-6">
        <a
          href={process.env.NEXT_PUBLIC_DRIVER_URL ?? 'http://localhost:3002'}
          className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-brand-foreground text-white text-sm font-semibold rounded-2xl hover:opacity-90 transition-all"
        >
          <Bike size={16} />
          Vous êtes livreur ? Accéder à l&apos;espace livreur
        </a>
      </div>
    </div>
  )
}
