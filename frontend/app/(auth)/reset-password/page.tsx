'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock } from 'lucide-react'
import { Logo } from '@/components/logo'
import { Input } from '@/components/input'
import { Button } from '@/components/button'
import { apiPost } from '@/lib/api'

type FieldErrors = Partial<Record<'password', string>>

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const token = searchParams.get('token') ?? ''
  const email = searchParams.get('email') ?? ''

  const [form, setForm] = useState({ password: '', password_confirmation: '' })
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
      await apiPost('/auth/reset-password', { email, token, ...form })
      router.push('/login?reset=1')
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

  if (!token || !email) {
    return (
      <div className="px-4 py-5 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700 text-center">
        Lien de réinitialisation invalide.{' '}
        <Link href="/forgot-password" className="font-semibold underline">
          Faire une nouvelle demande
        </Link>
      </div>
    )
  }

  return (
    <>
      {globalError && (
        <div className="mb-5 px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-600">
          {globalError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          label="Nouveau mot de passe"
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
          {loading ? 'Réinitialisation…' : 'Réinitialiser le mot de passe'}
        </Button>
      </form>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-8 sm:mb-10">
        <div className="flex justify-center mb-4">
          <Logo size="lg" />
        </div>
        <p className="text-sm text-gray-700">Choisissez un nouveau mot de passe</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-sm shadow-primary/5 p-5 sm:p-8">
        <h1 className="text-xl font-bold text-brand-foreground mb-6">
          Nouveau mot de passe
        </h1>

        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
      </div>

      {/* Back to login */}
      <p className="text-center text-sm text-gray-700 mt-6">
        <Link href="/login" className="text-primary font-semibold hover:underline">
          ← Retour à la connexion
        </Link>
      </p>
    </div>
  )
}
