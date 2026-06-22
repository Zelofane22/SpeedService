'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail } from 'lucide-react'
import { Logo } from '@/components/logo'
import { Input } from '@/components/input'
import { Button } from '@/components/button'
import { apiPost } from '@/lib/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [globalError, setGlobalError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setEmailError('')
    setGlobalError('')

    try {
      await apiPost('/auth/forgot-password', { email })
      setSuccess(true)
    } catch (err: unknown) {
      if (err instanceof Error && 'errors' in err) {
        const apiErrors = (err as Error & { errors?: Record<string, string[]> }).errors
        if (apiErrors?.email) {
          setEmailError(apiErrors.email[0])
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
        <p className="text-sm text-primary-400">Réinitialisez votre mot de passe</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl border border-brand-border shadow-sm shadow-primary/5 p-8">
        <h1 className="text-xl font-bold text-brand-foreground mb-2">Mot de passe oublié ?</h1>
        <p className="text-sm text-primary-400 mb-6">
          Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
        </p>

        {success ? (
          <div className="px-4 py-5 rounded-2xl bg-green-50 border border-green-200 text-sm text-green-700 text-center leading-relaxed">
            Si un compte correspond à cette adresse, vous recevrez un lien de réinitialisation dans quelques minutes.
          </div>
        ) : (
          <>
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
                value={email}
                onChange={e => {
                  setEmail(e.target.value)
                  setEmailError('')
                  setGlobalError('')
                }}
                error={emailError}
                required
              />

              <Button
                type="submit"
                disabled={loading}
                className="w-full mt-2 h-12 rounded-2xl bg-primary text-white font-semibold hover:bg-primary-800 shadow-lg shadow-primary/25 transition-all active:scale-[0.98]"
              >
                {loading ? 'Envoi en cours…' : 'Envoyer le lien'}
              </Button>
            </form>
          </>
        )}
      </div>

      {/* Back to login */}
      <p className="text-center text-sm text-primary-400 mt-6">
        <Link href="/login" className="text-primary font-semibold hover:underline">
          ← Retour à la connexion
        </Link>
      </p>
    </div>
  )
}
