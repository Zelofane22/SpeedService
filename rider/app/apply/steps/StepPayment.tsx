'use client'

import type { FormData } from '../page'

type Props = { data: FormData; onChange: (p: Partial<FormData>) => void; onNext: () => void }

const METHODS = [
  { value: 'mtn_momo', label: 'MTN MoMo', icon: '📱' },
  { value: 'moov_money', label: 'Moov Money', icon: '📲' },
  { value: 'bank', label: 'Virement bancaire', icon: '🏦' },
]

export default function StepPayment({ data, onChange, onNext }: Props) {
  const isMobile = data.payment_method === 'mtn_momo' || data.payment_method === 'moov_money'
  const isBank = data.payment_method === 'bank'
  const valid = data.payment_method && (isMobile ? data.payment_number : (isBank ? data.bank_name && data.bank_iban : false))

  return (
    <div className="p-5 flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold">Informations de paiement</h2>
        <p className="text-sm text-gray-500 mt-1">Étape 5 sur 7 — Pour recevoir vos revenus</p>
      </div>

      <div className="flex flex-col gap-2">
        {METHODS.map(({ value, label, icon }) => (
          <button key={value} onClick={() => onChange({ payment_method: value })} className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-colors ${data.payment_method === value ? 'border-[#861D6D] bg-purple-50' : 'border-gray-200'}`}>
            <span className="text-2xl">{icon}</span>
            <span className="font-medium text-sm">{label}</span>
            {data.payment_method === value && <span className="ml-auto text-[#861D6D]">✓</span>}
          </button>
        ))}
      </div>

      {isMobile && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de téléphone</label>
          <input type="tel" className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#861D6D]" value={data.payment_number} onChange={(e) => onChange({ payment_number: e.target.value })} placeholder="+229 97 00 00 00" />
        </div>
      )}

      {isBank && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la banque</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#861D6D]" value={data.bank_name} onChange={(e) => onChange({ bank_name: e.target.value })} placeholder="BOA, Ecobank…" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">IBAN / Numéro de compte</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#861D6D]" value={data.bank_iban} onChange={(e) => onChange({ bank_iban: e.target.value })} placeholder="BJ66 …" />
          </div>
        </>
      )}

      <button disabled={!valid} onClick={onNext} className="w-full bg-[#861D6D] disabled:bg-gray-300 text-white py-4 rounded-xl font-semibold text-lg mt-2">
        Continuer →
      </button>
    </div>
  )
}
