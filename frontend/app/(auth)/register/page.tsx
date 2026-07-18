'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, User, Mail, Phone, Lock } from 'lucide-react'
import { Logo } from '@/components/logo'
import { Input } from '@/components/input'
import { Button } from '@/components/button'
import { apiPost } from '@/lib/api'

type FormState = {
  name: string
  email: string
  phone: string
  password: string
  password_confirmation: string
}

type FieldName = keyof FormState
type FieldErrors = Partial<Record<FieldName, string>>

type RegisterResponse = {
  user: { id: string; name: string; email: string | null; phone: string; role: string }
  token: string
}

function normalizePhone(value: string) {
  return value.replace(/[\s.-]/g, '')
}

function isBeninPhone(value: string) {
  return /^\+22901\d{8}$/.test(normalizePhone(value))
}

function validateRegisterForm(form: FormState) {
  const errors: FieldErrors = {}

  if (!form.name.trim()) {
    errors.name = 'Le nom complet est obligatoire.'
  }

  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Saisissez une adresse email valide.'
  }

  if (!form.phone.trim()) {
    errors.phone = 'Le numero de telephone est obligatoire.'
  } else if (!isBeninPhone(form.phone)) {
    errors.phone = 'Utilisez le format beninois +229 01 XX XX XX XX.'
  }

  if (!form.password) {
    errors.password = 'Le mot de passe est obligatoire.'
  } else if (form.password.length < 8) {
    errors.password = 'Le mot de passe doit contenir au moins 8 caracteres.'
  }

  if (!form.password_confirmation) {
    errors.password_confirmation = 'Confirmez votre mot de passe.'
  } else if (form.password && form.password_confirmation !== form.password) {
    errors.password_confirmation = 'Les mots de passe ne correspondent pas.'
  }

  return errors
}

function visibleErrors(
  errors: FieldErrors,
  touchedFields: Partial<Record<FieldName, boolean>>,
  hasSubmitted: boolean,
) {
  if (hasSubmitted) return errors

  return Object.fromEntries(
    Object.entries(errors).filter(([field]) => touchedFields[field as FieldName]),
  ) as FieldErrors
}

function passwordStrength(password: string) {
  let score = 0
  if (password.length >= 8) score += 1
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1

  if (score <= 1) return { label: 'Faible', width: 'w-1/4', color: 'bg-red-500' }
  if (score === 2) return { label: 'Correct', width: 'w-2/4', color: 'bg-amber-500' }
  if (score === 3) return { label: 'Bon', width: 'w-3/4', color: 'bg-primary' }
  return { label: 'Fort', width: 'w-full', color: 'bg-green-600' }
}

export default function RegisterPage() {
  const router = useRouter()

  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [touchedFields, setTouchedFields] = useState<Partial<Record<FieldName, boolean>>>({})
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [globalError, setGlobalError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const strength = passwordStrength(form.password)

  function set(field: FieldName) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const nextForm = { ...form, [field]: e.target.value }
      const nextTouchedFields = { ...touchedFields, [field]: true }
      setForm(nextForm)
      setTouchedFields(nextTouchedFields)
      setFieldErrors(visibleErrors(validateRegisterForm(nextForm), nextTouchedFields, hasSubmitted))
      setGlobalError('')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setGlobalError('')
    setHasSubmitted(true)

    const errors = validateRegisterForm(form)
    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    setLoading(true)

    try {
      const data = await apiPost<RegisterResponse>('/auth/register', {
        ...form,
        email: form.email.trim() || undefined,
        phone: normalizePhone(form.phone),
      })
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
            label="Adresse email (optionnel)"
            type="email"
            placeholder="koffi@gmail.com"
            autoComplete="email"
            icon={Mail}
            value={form.email}
            onChange={set('email')}
            error={fieldErrors.email}
          />

          <Input
            label="Numéro de téléphone"
            type="tel"
            placeholder="+229 01 97 00 00 00"
            autoComplete="tel"
            icon={Phone}
            value={form.phone}
            onChange={set('phone')}
            error={fieldErrors.phone}
            required
          />

          <Input
            label="Mot de passe"
            type={showPassword ? 'text' : 'password'}
            placeholder="8 caractères minimum"
            autoComplete="new-password"
            icon={Lock}
            value={form.password}
            onChange={set('password')}
            error={fieldErrors.password}
            rightElement={(
              <button
                type="button"
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                onClick={() => setShowPassword(prev => !prev)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-700 transition-colors hover:bg-brand-muted"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            )}
            required
          />
          {form.password && (
            <div className="space-y-1.5">
              <div className="h-1.5 overflow-hidden rounded-full bg-brand-muted">
                <div className={`${strength.width} ${strength.color} h-full rounded-full transition-all`} />
              </div>
              <p className="text-xs text-gray-700">Force du mot de passe : {strength.label}</p>
            </div>
          )}

          <Input
            label="Confirmer le mot de passe"
            type={showConfirmation ? 'text' : 'password'}
            placeholder="Répétez votre mot de passe"
            autoComplete="new-password"
            icon={Lock}
            value={form.password_confirmation}
            onChange={set('password_confirmation')}
            error={fieldErrors.password_confirmation}
            rightElement={(
              <button
                type="button"
                aria-label={showConfirmation ? 'Masquer la confirmation' : 'Afficher la confirmation'}
                onClick={() => setShowConfirmation(prev => !prev)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-700 transition-colors hover:bg-brand-muted"
              >
                {showConfirmation ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            )}
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
