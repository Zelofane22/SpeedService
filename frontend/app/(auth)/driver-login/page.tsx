'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Bike, ArrowLeft } from 'lucide-react'
import { Logo } from '@/components/logo'
import { Input } from '@/components/input'
import { Button } from '@/components/button'
import { apiPost } from '@/lib/api'

type FieldErrors = Partial<Record<'email' | 'password', string>>

type LoginResponse = {
  user: { id: string; name: string; email: string; phone: string; role: string }
  token: string
}

export default function DriverLoginPage() {
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

      if (data.user.role !== 'driver') {
        setGlobalError('Ce compte n\'est pas un compte livreur. Utilisez la connexion client.')
        return
      }

      localStorage.setItem('auth_token', data.token)
      router.push('/driver/missions')
    } catch (err: unknown) {
      if (err instanceof Error && 'errors' in err) {
        const apiErrors = (err as Error & { errors?: Record<string, string[]> }).errors
        if (apiErrors) {
          const mapped: FieldErrors = {}
          for (const [key, msgs] of Object.entries(apiErrors)) {
            mapped[key as keyof FieldErrors] = msgs[0]
          }
          setFieldErrors(mapped)
          return
        }
      }
      setGlobalError(err instanceof Error ? err.message : 'Une erreur inattendue est survenue.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Header livreur */}
      <div className="bg-brand-foreground rounded-3xl p-8 mb-6 text-white text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center">
            <Bike size={32} className="text-white" />
          </div>
        </div>
        <div className="flex justify-center mb-3">
          <Logo size="lg" className="[&_span]:text-white [&_.text-primary]:text-primary-300" />
        </div>
        <span className="inline-block text-xs font-bold uppercase tracking-widest bg-primary px-3 py-1 rounded-full">
          Espace Livreur
        </span>
        <p className="text-sm text-white/70 mt-3">
          Connectez-vous pour accéder à vos missions
        </p>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-3xl border border-brand-border shadow-sm shadow-primary/5 p-8">
        <h1 className="text-xl font-bold text-brand-foreground mb-6">Connexion livreur</h1>

        {globalError && (
          <div className="mb-5 px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-600">
            {globalError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Input
            label="Adresse email"
            type="email"
            placeholder="livreur@speedservice.bj"
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

          <Button
            type="submit"
            disabled={loading}
            className="w-full mt-2 h-12 rounded-2xl bg-brand-foreground text-white font-semibold hover:opacity-90 shadow-lg transition-all active:scale-[0.98]"
          >
            {loading ? 'Connexion en cours…' : 'Accéder à mes missions'}
          </Button>
        </form>
      </div>

      {/* Back to client login */}
      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-brand-foreground transition-colors"
        >
          <ArrowLeft size={14} />
          Retour à la connexion client
        </Link>
      </div>
    </div>
  )
}
