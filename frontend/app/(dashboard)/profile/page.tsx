'use client'

import { useState } from 'react'
import { User, Phone, Lock } from 'lucide-react'
import { Input } from '@/components/input'
import { Button } from '@/components/button'
import { apiPut } from '@/lib/api'
import { useAuthUser, type AuthUser } from '@/lib/auth-context'

type ProfileErrors = Partial<Record<'name' | 'phone', string>>
type PasswordErrors = Partial<Record<'current_password' | 'password' | 'password_confirmation', string>>

function mapErrors<T extends Record<string, string>>(apiErrors: Record<string, string[]>): T {
  const mapped = {} as T
  for (const [key, msgs] of Object.entries(apiErrors)) {
    (mapped as Record<string, string>)[key] = msgs[0]
  }
  return mapped
}

export default function ProfilePage() {
  const { user, setUser } = useAuthUser()

  const [profileForm, setProfileForm] = useState({ name: user.name, phone: user.phone })
  const [profileErrors, setProfileErrors] = useState<ProfileErrors>({})
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  })
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({})
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  function setProfileField(field: keyof typeof profileForm) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setProfileForm(prev => ({ ...prev, [field]: e.target.value }))
      setProfileErrors(prev => ({ ...prev, [field]: undefined }))
      setProfileSuccess(false)
    }
  }

  function setPasswordField(field: keyof typeof passwordForm) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setPasswordForm(prev => ({ ...prev, [field]: e.target.value }))
      setPasswordErrors(prev => ({ ...prev, [field]: undefined }))
      setPasswordSuccess(false)
    }
  }

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault()
    setProfileLoading(true)
    setProfileErrors({})
    setProfileSuccess(false)

    try {
      const updated = await apiPut<AuthUser>('/profile', profileForm)
      setUser(updated)
      setProfileSuccess(true)
    } catch (err: unknown) {
      if (err instanceof Error && 'errors' in err) {
        const apiErrors = (err as Error & { errors?: Record<string, string[]> }).errors
        if (apiErrors) setProfileErrors(mapErrors<ProfileErrors>(apiErrors))
      }
    } finally {
      setProfileLoading(false)
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPasswordLoading(true)
    setPasswordErrors({})
    setPasswordSuccess(false)

    try {
      await apiPut('/profile', { name: user.name, phone: user.phone, ...passwordForm })
      setPasswordSuccess(true)
      setPasswordForm({ current_password: '', password: '', password_confirmation: '' })
    } catch (err: unknown) {
      if (err instanceof Error && 'errors' in err) {
        const apiErrors = (err as Error & { errors?: Record<string, string[]> }).errors
        if (apiErrors) setPasswordErrors(mapErrors<PasswordErrors>(apiErrors))
      }
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-brand-foreground">Mon profil</h1>
        <p className="text-sm text-gray-700 mt-1">Gérez vos informations personnelles et votre mot de passe.</p>
      </div>

      {/* Informations personnelles */}
      <div className="bg-white rounded-3xl border border-brand-border shadow-sm shadow-primary/5 p-8">
        <h2 className="text-lg font-bold text-brand-foreground mb-1">Informations personnelles</h2>
        <p className="text-sm text-gray-700 mb-6">Modifiez votre nom ou numéro de téléphone.</p>

        {profileSuccess && (
          <div className="mb-5 px-4 py-3 rounded-2xl bg-green-50 border border-green-200 text-sm text-green-700">
            Profil mis à jour avec succès.
          </div>
        )}

        <form onSubmit={handleProfileSubmit} noValidate className="space-y-4">
          <Input
            label="Adresse email"
            type="email"
            value={user.email}
            disabled
            icon={User}
            className="opacity-60 cursor-not-allowed"
          />

          <Input
            label="Nom complet"
            type="text"
            placeholder="Koffi Mensah"
            autoComplete="name"
            icon={User}
            value={profileForm.name}
            onChange={setProfileField('name')}
            error={profileErrors.name}
            required
          />

          <Input
            label="Numéro de téléphone"
            type="tel"
            placeholder="+22997000000"
            autoComplete="tel"
            icon={Phone}
            value={profileForm.phone}
            onChange={setProfileField('phone')}
            error={profileErrors.phone}
            required
          />

          <Button
            type="submit"
            disabled={profileLoading}
            className="w-full h-12 rounded-2xl bg-primary text-white font-semibold hover:bg-primary-800 shadow-lg shadow-primary/25 transition-all active:scale-[0.98]"
          >
            {profileLoading ? 'Enregistrement…' : 'Enregistrer les modifications'}
          </Button>
        </form>
      </div>

      {/* Changement de mot de passe */}
      <div className="bg-white rounded-3xl border border-brand-border shadow-sm shadow-primary/5 p-8">
        <h2 className="text-lg font-bold text-brand-foreground mb-1">Changer le mot de passe</h2>
        <p className="text-sm text-gray-700 mb-6">Laissez vide si vous ne souhaitez pas changer de mot de passe.</p>

        {passwordSuccess && (
          <div className="mb-5 px-4 py-3 rounded-2xl bg-green-50 border border-green-200 text-sm text-green-700">
            Mot de passe mis à jour avec succès.
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} noValidate className="space-y-4">
          <Input
            label="Mot de passe actuel"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            icon={Lock}
            value={passwordForm.current_password}
            onChange={setPasswordField('current_password')}
            error={passwordErrors.current_password}
            required
          />

          <Input
            label="Nouveau mot de passe"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            icon={Lock}
            value={passwordForm.password}
            onChange={setPasswordField('password')}
            error={passwordErrors.password}
            required
          />

          <Input
            label="Confirmer le nouveau mot de passe"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            icon={Lock}
            value={passwordForm.password_confirmation}
            onChange={setPasswordField('password_confirmation')}
            error={passwordErrors.password_confirmation}
            required
          />

          <Button
            type="submit"
            disabled={passwordLoading}
            className="w-full h-12 rounded-2xl bg-primary text-white font-semibold hover:bg-primary-800 shadow-lg shadow-primary/25 transition-all active:scale-[0.98]"
          >
            {passwordLoading ? 'Mise à jour…' : 'Mettre à jour le mot de passe'}
          </Button>
        </form>
      </div>
    </div>
  )
}
