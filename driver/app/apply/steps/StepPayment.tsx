'use client'

import type { FormData } from '../page'
import { getPaymentErrors, isValidBankAccount, isValidBeninPhone, PHONE_HELP, PHONE_PATTERN } from '../validation'

type Props = { data: FormData; onChange: (p: Partial<FormData>) => void; onNext: () => void }

const METHODS = [
  { value: 'mtn_momo', label: 'MTN MoMo', icon: '📱' },
  { value: 'moov_money', label: 'Moov Money', icon: '📲' },
  { value: 'bank', label: 'Virement bancaire', icon: '🏦' },
]

export default function StepPayment({ data, onChange, onNext }: Props) {
  const isMobile = data.payment_method === 'mtn_momo' || data.payment_method === 'moov_money'
  const isBank = data.payment_method === 'bank'
  const errors = getPaymentErrors(data)
  const valid = errors.length === 0
  const phoneError = isMobile && data.payment_number && !isValidBeninPhone(data.payment_number) ? PHONE_HELP : null
  const bankAccountError = isBank && data.bank_iban && !isValidBankAccount(data.bank_iban)
    ? '8 à 34 caractères, lettres, chiffres, espaces ou tirets.'
    : null

  return (
    <div className="p-5 flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold">Informations de paiement</h2>
        <p className="text-sm text-gray-500 mt-1">Étape 5 sur 7 — Pour recevoir vos revenus</p>
      </div>

      <div className="flex flex-col gap-2">
        {METHODS.map(({ value, label, icon }) => (
          <button key={value} type="button" aria-pressed={data.payment_method === value} onClick={() => onChange({ payment_method: value })} className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-colors ${data.payment_method === value ? 'border-[#861D6D] bg-purple-50' : 'border-gray-200'}`}>
            <span className="text-2xl">{icon}</span>
            <span className="font-medium text-sm">{label}</span>
            {data.payment_method === value && <span className="ml-auto text-[#861D6D]">✓</span>}
          </button>
        ))}
      </div>

      {isMobile && (
        <div>
          <label htmlFor="payment-phone" className="block text-sm font-medium text-gray-700 mb-1">Numéro de téléphone</label>
          <input
            id="payment-phone"
            name="tel"
            type="tel"
            required
            pattern={PHONE_PATTERN}
            maxLength={21}
            inputMode="tel"
            autoComplete="tel"
            aria-describedby={phoneError ? 'payment-phone-error' : 'payment-phone-help'}
            className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#861D6D]"
            value={data.payment_number}
            onChange={(e) => onChange({ payment_number: e.target.value })}
            placeholder="+229 01 97 00 00 00"
          />
          {phoneError ? (
            <p id="payment-phone-error" className="mt-1 text-xs text-red-700">{phoneError}</p>
          ) : (
            <p id="payment-phone-help" className="mt-1 text-xs text-gray-500">{PHONE_HELP}</p>
          )}
        </div>
      )}

      {isBank && (
        <>
          <div>
            <label htmlFor="payment-bank-name" className="block text-sm font-medium text-gray-700 mb-1">Nom de la banque</label>
            <input
              id="payment-bank-name"
              name="organization"
              required
              maxLength={80}
              autoComplete="organization"
              className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#861D6D]"
              value={data.bank_name}
              onChange={(e) => onChange({ bank_name: e.target.value })}
              placeholder="BOA, Ecobank…"
            />
          </div>
          <div>
            <label htmlFor="payment-bank-account" className="block text-sm font-medium text-gray-700 mb-1">IBAN / Numéro de compte</label>
            <input
              id="payment-bank-account"
              name="payment-bank-account"
              required
              minLength={8}
              maxLength={34}
              autoComplete="off"
              aria-describedby={bankAccountError ? 'payment-bank-account-error' : undefined}
              className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-[#861D6D]"
              value={data.bank_iban}
              onChange={(e) => onChange({ bank_iban: e.target.value.toUpperCase() })}
              placeholder="BJ66 …"
            />
            {bankAccountError && <p id="payment-bank-account-error" className="mt-1 text-xs text-red-700">{bankAccountError}</p>}
          </div>
        </>
      )}

      {!valid && <p className="text-sm text-red-700" role="status">{errors[0]}</p>}

      <button type="button" disabled={!valid} onClick={onNext} className="w-full bg-[#861D6D] disabled:bg-gray-300 text-white py-4 rounded-xl font-semibold text-lg mt-2">
        Continuer →
      </button>
    </div>
  )
}
