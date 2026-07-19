'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bell,
  Bike,
  CreditCard,
  KeyRound,
  Languages,
  Loader2,
  LogOut,
  Palette,
  Save,
  Shield,
  UserRound,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { ThemeToggle } from '@speedservice/ui'
import { apiGet, apiPatch, apiPost, apiPut, type DriverUser } from '@/lib/api-client'
import { cn } from '@/lib/utils'

type DriverApplication = {
  city?: string | null
  vehicle_type?: string | null
  vehicle_brand?: string | null
  vehicle_plate?: string | null
  payment_method?: string | null
  payment_number?: string | null
  bank_name?: string | null
  bank_iban?: string | null
  status?: string | null
}

type DriverProfile = {
  user: DriverUser
  application: DriverApplication | null
}

type AvailabilityResponse = {
  id: string
  is_online: boolean
}

type Preferences = {
  sms: boolean
  email: boolean
  push: boolean
  language: 'fr' | 'fon' | 'en'
}

const PREF_KEY = 'speedservice-driver-settings'

const DEFAULT_PREFS: Preferences = {
  sms: true,
  email: true,
  push: true,
  language: 'fr',
}

const VEHICLE_LABELS: Record<string, string> = {
  bicycle: 'Vélo',
  motorcycle: 'Moto',
  car: 'Voiture',
  van: 'Camionnette',
}

const PAYMENT_LABELS: Record<string, string> = {
  mtn_momo: 'MTN MoMo',
  moov_money: 'Moov Money',
  bank_transfer: 'Virement bancaire',
}

function readPreferences(): Preferences {
  try {
    const raw = localStorage.getItem(PREF_KEY)
    if (!raw) return DEFAULT_PREFS
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_PREFS
  }
}

function FieldValue({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 dark:text-[#b9adba]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#1D1D1F] dark:text-gray-100">{value || 'Non renseigné'}</p>
    </div>
  )
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: LucideIcon
  children: React.ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-[#39313d] dark:bg-[#181A20]">
      <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 dark:border-[#2a2430]">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#861D6D]/10 text-[#861D6D] dark:bg-[#332039] dark:text-[#f0a8df]">
          <Icon size={18} aria-hidden="true" />
        </div>
        <h2 className="text-base font-bold text-[#1D1D1F] dark:text-gray-100">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </section>
  )
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between gap-4 py-3">
      <span>
        <span className="block text-sm font-semibold text-[#1D1D1F] dark:text-gray-100">{label}</span>
        <span className="block text-xs text-gray-500 dark:text-[#b9adba]">{description}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 rounded border-gray-300 accent-[#861D6D]"
      />
    </label>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<DriverProfile | null>(null)
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFS)
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' })
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  })
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [availabilityUpdating, setAvailabilityUpdating] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setPreferences(readPreferences())

    apiGet<DriverProfile>('/driver/profile')
      .then((data) => {
        setProfile(data)
        setProfileForm({ name: data.user.name, phone: data.user.phone })
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  function updatePreference<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    const next = { ...preferences, [key]: value }
    setPreferences(next)
    try {
      localStorage.setItem(PREF_KEY, JSON.stringify(next))
    } catch {
      setError('Préférences appliquées pour cette session seulement.')
    }
  }

  async function toggleAvailability() {
    if (!profile) return
    setAvailabilityUpdating(true)
    setError(null)
    setMessage(null)
    try {
      const next = !profile.user.is_online
      const updated = await apiPatch<AvailabilityResponse>('/driver/availability', { is_online: next })
      setProfile((current) => current ? { ...current, user: { ...current.user, is_online: updated.is_online } } : current)
      setMessage(updated.is_online ? 'Vous êtes en ligne.' : 'Vous êtes hors ligne.')
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Disponibilité non mise à jour.')
    } finally {
      setAvailabilityUpdating(false)
    }
  }

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!profile) return
    setSavingProfile(true)
    setError(null)
    setMessage(null)
    try {
      const updated = await apiPut<DriverUser>('/profile', profileForm)
      setProfile({ ...profile, user: { ...profile.user, ...updated } })
      setMessage('Profil mis à jour.')
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Profil non mis à jour.')
    } finally {
      setSavingProfile(false)
    }
  }

  async function changePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSavingPassword(true)
    setError(null)
    setMessage(null)
    try {
      await apiPatch('/profile/change-password', passwordForm)
      setPasswordForm({ current_password: '', password: '', password_confirmation: '' })
      setMessage('Mot de passe mis à jour.')
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Mot de passe non mis à jour.')
    } finally {
      setSavingPassword(false)
    }
  }

  async function logout() {
    try { await apiPost('/auth/logout', {}) } finally {
      localStorage.removeItem('driver_token')
      router.replace('/login')
    }
  }

  const app = profile?.application
  const isOnline = profile?.user.is_online ?? true

  return (
    <div className="space-y-4 px-5 pb-6 pt-5">
      <div>
        <h1 className="text-xl font-bold text-[#1D1D1F] dark:text-gray-100">Paramètres</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-[#b9adba]">Compte livreur, disponibilité et préférences.</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-200">
          {message}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#861D6D] border-t-transparent" />
        </div>
      ) : (
        <>
          <Section title="Disponibilité" icon={Shield}>
            <button
              type="button"
              onClick={toggleAvailability}
              disabled={availabilityUpdating}
              aria-pressed={isOnline}
              className={cn(
                'flex min-h-12 w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#861D6D]/40 disabled:opacity-60',
                isOnline
                  ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-200'
                  : 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-[#202128] dark:text-gray-200',
              )}
            >
              <span>
                <span className="block text-sm font-bold">{isOnline ? 'En ligne' : 'Hors ligne'}</span>
                <span className="block text-xs opacity-80">
                  {isOnline ? 'Vous pouvez recevoir des missions.' : 'Aucune nouvelle mission ne vous sera proposée.'}
                </span>
              </span>
              {availabilityUpdating ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <span className={cn('h-3 w-3 rounded-full', isOnline ? 'bg-green-500' : 'bg-gray-400')} />}
            </button>
          </Section>

          <Section title="Profil" icon={UserRound}>
            <form onSubmit={saveProfile} className="space-y-3">
              <label className="block">
                <span className="text-xs font-medium text-gray-500 dark:text-[#b9adba]">Nom complet</span>
                <input
                  value={profileForm.name}
                  onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#861D6D]/30 dark:border-gray-700 dark:bg-[#202128] dark:text-gray-100"
                  autoComplete="name"
                  required
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-gray-500 dark:text-[#b9adba]">Téléphone</span>
                <input
                  value={profileForm.phone}
                  onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#861D6D]/30 dark:border-gray-700 dark:bg-[#202128] dark:text-gray-100"
                  autoComplete="tel"
                  required
                />
              </label>
              <FieldValue label="Email" value={profile?.user.email} />
              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#861D6D] px-4 py-3 text-sm font-semibold text-white transition-transform active:scale-95 disabled:opacity-60 dark:bg-[#b24799]"
              >
                {savingProfile ? <Loader2 size={17} className="animate-spin" aria-hidden="true" /> : <Save size={17} aria-hidden="true" />}
                <span>{savingProfile ? 'Enregistrement…' : 'Enregistrer le profil'}</span>
              </button>
            </form>
          </Section>

          <Section title="Véhicule" icon={Bike}>
            <div className="grid grid-cols-2 gap-4">
              <FieldValue label="Type" value={app?.vehicle_type ? VEHICLE_LABELS[app.vehicle_type] ?? app.vehicle_type : null} />
              <FieldValue label="Ville" value={app?.city} />
              <FieldValue label="Marque" value={app?.vehicle_brand} />
              <FieldValue label="Immatriculation" value={app?.vehicle_plate} />
            </div>
          </Section>

          <Section title="Paiement" icon={CreditCard}>
            <div className="grid grid-cols-1 gap-4">
              <FieldValue label="Méthode de règlement" value={app?.payment_method ? PAYMENT_LABELS[app.payment_method] ?? app.payment_method : null} />
              <FieldValue label="Numéro de paiement" value={app?.payment_number} />
              <FieldValue label="Banque" value={app?.bank_name} />
            </div>
          </Section>

          <Section title="Notifications" icon={Bell}>
            <div className="divide-y divide-gray-100 dark:divide-[#2a2430]">
              <ToggleRow label="SMS" description="Alertes de mission et rappels importants." checked={preferences.sms} onChange={(checked) => updatePreference('sms', checked)} />
              <ToggleRow label="Email" description="Récapitulatifs et informations de compte." checked={preferences.email} onChange={(checked) => updatePreference('email', checked)} />
              <ToggleRow label="Push PWA" description="Notifications sur cet appareil." checked={preferences.push} onChange={(checked) => updatePreference('push', checked)} />
            </div>
          </Section>

          <Section title="Langue" icon={Languages}>
            <select
              value={preferences.language}
              onChange={(event) => updatePreference('language', event.target.value as Preferences['language'])}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm font-semibold text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#861D6D]/30 dark:border-gray-700 dark:bg-[#202128] dark:text-gray-100"
            >
              <option value="fr">Français</option>
              <option value="fon">Fon</option>
              <option value="en">English</option>
            </select>
          </Section>

          <Section title="Apparence" icon={Palette}>
            <ThemeToggle />
          </Section>

          <Section title="Sécurité" icon={KeyRound}>
            <form onSubmit={changePassword} className="space-y-3">
              <input
                type="password"
                value={passwordForm.current_password}
                onChange={(event) => setPasswordForm((current) => ({ ...current, current_password: event.target.value }))}
                placeholder="Mot de passe actuel"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#861D6D]/30 dark:border-gray-700 dark:bg-[#202128] dark:text-gray-100"
                autoComplete="current-password"
                required
              />
              <input
                type="password"
                value={passwordForm.password}
                onChange={(event) => setPasswordForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="Nouveau mot de passe"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#861D6D]/30 dark:border-gray-700 dark:bg-[#202128] dark:text-gray-100"
                autoComplete="new-password"
                minLength={8}
                required
              />
              <input
                type="password"
                value={passwordForm.password_confirmation}
                onChange={(event) => setPasswordForm((current) => ({ ...current, password_confirmation: event.target.value }))}
                placeholder="Confirmer le nouveau mot de passe"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#861D6D]/30 dark:border-gray-700 dark:bg-[#202128] dark:text-gray-100"
                autoComplete="new-password"
                minLength={8}
                required
              />
              <button
                type="submit"
                disabled={savingPassword}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-[#1D1D1F] transition-transform active:scale-95 disabled:opacity-60 dark:border-gray-700 dark:text-gray-100"
              >
                {savingPassword && <Loader2 size={17} className="animate-spin" aria-hidden="true" />}
                <span>{savingPassword ? 'Mise à jour…' : 'Mettre à jour le mot de passe'}</span>
              </button>
            </form>
          </Section>

          <Section title="Gestion du compte" icon={Shield}>
            <div className="space-y-3">
              <a
                href="mailto:support@speedservice.bj?subject=Compte%20livreur"
                className="flex min-h-11 items-center justify-center rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-[#1D1D1F] dark:border-gray-700 dark:text-gray-100"
              >
                Contacter le support
              </a>
              <button
                type="button"
                onClick={logout}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1D1D1F] px-4 py-3 text-sm font-semibold text-white dark:bg-gray-100 dark:text-[#101114]"
              >
                <LogOut size={17} aria-hidden="true" />
                <span>Se déconnecter</span>
              </button>
            </div>
          </Section>
        </>
      )}
    </div>
  )
}
