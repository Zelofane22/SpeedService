'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, Mail, Phone, Lock } from 'lucide-react'
import { Logo } from '@/components/logo'
import { Input } from '@/components/input'
import { Button } from '@/components/button'
import { apiPost } from '@/lib/api'

type FieldErrors = Partial<Record<'name' | 'email' | 'phone' | 'password', string>>

type RegisterResponse = {
  user: { id: string; name: string; email: string; phone: string; role: string }
  token: string
}

export default function RegisterPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  })
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
      const data = await apiPost<RegisterResponse>('/auth/register', form)
      // Persiste le token côté client (Sprint 2+ utilisera un store dédié)
      localStorage.setItem('auth_token', data.token)
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
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Logo size="lg" />
        </div>
        <p className="text-sm text-gray-700">Créez votre compte pour commencer</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-sm shadow-primary/5 p-5 sm:p-8">
        <h1 className="text-xl font-bold text-brand-foreground mb-6">Inscription</h1>

        {globalError && (
          <div className="mb-5 px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-600">
            {globalError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Input
            label="Nom complet"
            type="text"
            placeholder="Koffi Mensah"
            autoComplete="name"
            icon={User}
            value={form.name}
            onChange={set('name')}
            error={fieldErrors.name}
            required
          />

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
            label="Numéro de téléphone"
            type="tel"
            placeholder="+229 97 00 00 00"
            autoComplete="tel"
            icon={Phone}
            value={form.phone}
            onChange={set('phone')}
            error={fieldErrors.phone}
            required
          />

          <Input
            label="Mot de passe"
            type="password"
            placeholder="8 caractères minimum"
            autoComplete="new-password"
            icon={Lock}
            value={form.password}
            onChange={set('password')}
            error={fieldErrors.password}
            required
          />

          <Input
            label="Confirmer le mot de passe"
            type="password"
            placeholder="Répétez votre mot de passe"
            autoComplete="new-password"
            icon={Lock}
            value={form.password_confirmation}
            onChange={set('password_confirmation')}
            required
          />

          <Button
            type="submit"
            disabled={loading}
            className="w-full mt-2 h-12 rounded-2xl bg-primary text-white font-semibold hover:bg-primary-800 shadow-lg shadow-primary/25 transition-all active:scale-[0.98]"
          >
            {loading ? 'Création en cours…' : 'Créer mon compte'}
          </Button>
        </form>
      </div>

      {/* Link to login */}
      <p className="text-center text-sm text-gray-700 mt-6">
        Déjà un compte ?{' '}
        <Link href="/login" className="text-primary font-semibold hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  )
}
