'use client'

import type { FormData } from '../page'
import { getPersonalErrors, isValidBeninPhone, isValidEmail, PHONE_HELP, PHONE_PATTERN } from '../validation'

type Props = { data: FormData; onChange: (p: Partial<FormData>) => void; onNext: () => void }

export default function StepPersonal({ data, onChange, onNext }: Props) {
  const errors = getPersonalErrors(data)
  const valid = errors.length === 0
  const emailError = data.email && !isValidEmail(data.email) ? 'Saisissez une adresse email valide.' : null
  const phoneError = data.phone && !isValidBeninPhone(data.phone) ? PHONE_HELP : null
  const passwordError = data.password && data.password.length < 8 ? '8 caractères minimum.' : null

  return (
    <div className="p-5 flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold text-[#1D1D1F]">Informations personnelles</h2>
        <p className="text-sm text-gray-500 mt-1">Étape 1 sur 7</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="driver-first-name" className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
          <input
            id="driver-first-name"
            name="given-name"
            required
            minLength={2}
            maxLength={80}
            autoComplete="given-name"
            className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#861D6D]"
            value={data.first_name}
            onChange={(e) => onChange({ first_name: e.target.value })}
            placeholder="Koffi"
          />
        </div>
        <div>
          <label htmlFor="driver-last-name" className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
          <input
            id="driver-last-name"
            name="family-name"
            required
            minLength={2}
            maxLength={80}
            autoComplete="family-name"
            className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#861D6D]"
            value={data.last_name}
            onChange={(e) => onChange({ last_name: e.target.value })}
            placeholder="Adjovi"
          />
        </div>
      </div>

      <div>
        <label htmlFor="driver-email" className="block text-sm font-medium text-gray-700 mb-1">Adresse email</label>
        <input
          id="driver-email"
          name="email"
          type="email"
          required
          maxLength={120}
          autoComplete="email"
          aria-describedby={emailError ? 'driver-email-error' : undefined}
          className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#861D6D]"
          value={data.email}
          onChange={(e) => onChange({ email: e.target.value })}
          placeholder="koffi@email.com"
        />
        {emailError && <p id="driver-email-error" className="mt-1 text-xs text-red-700">{emailError}</p>}
      </div>

      <div>
        <label htmlFor="driver-phone" className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
        <input
          id="driver-phone"
          name="tel"
          type="tel"
          required
          pattern={PHONE_PATTERN}
          maxLength={21}
          inputMode="tel"
          autoComplete="tel"
          aria-describedby={phoneError ? 'driver-phone-error' : 'driver-phone-help'}
          className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#861D6D]"
          value={data.phone}
          onChange={(e) => onChange({ phone: e.target.value })}
          placeholder="+229 01 97 00 00 00"
        />
        {phoneError ? (
          <p id="driver-phone-error" className="mt-1 text-xs text-red-700">{phoneError}</p>
        ) : (
          <p id="driver-phone-help" className="mt-1 text-xs text-gray-500">{PHONE_HELP}</p>
        )}
      </div>

      <div>
        <label htmlFor="driver-city" className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
        <select
          id="driver-city"
          name="address-level2"
          required
          autoComplete="address-level2"
          className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#861D6D] bg-white"
          value={data.city}
          onChange={(e) => onChange({ city: e.target.value })}
        >
          <option value="">Sélectionnez votre ville</option>
          {['Cotonou', 'Porto-Novo', 'Parakou', 'Abomey-Calavi', 'Bohicon', 'Natitingou'].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="driver-password" className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
        <input
          id="driver-password"
          name="new-password"
          type="password"
          required
          minLength={8}
          maxLength={72}
          autoComplete="new-password"
          aria-describedby={passwordError ? 'driver-password-error' : 'driver-password-help'}
          className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#861D6D]"
          value={data.password}
          onChange={(e) => onChange({ password: e.target.value })}
          placeholder="8 caractères minimum"
        />
        {passwordError ? (
          <p id="driver-password-error" className="mt-1 text-xs text-red-700">{passwordError}</p>
        ) : (
          <p id="driver-password-help" className="mt-1 text-xs text-gray-500">8 caractères minimum.</p>
        )}
      </div>

      {!valid && <p className="text-sm text-red-700" role="status">{errors[0]}</p>}

      <button type="button" disabled={!valid} onClick={onNext} className="w-full bg-[#861D6D] disabled:bg-gray-300 text-white py-4 rounded-xl font-semibold text-lg mt-2 transition-colors">
        Continuer →
      </button>
    </div>
  )
}
