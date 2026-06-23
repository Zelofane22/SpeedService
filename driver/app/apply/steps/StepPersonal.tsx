'use client'

import type { FormData } from '../page'

type Props = { data: FormData; onChange: (p: Partial<FormData>) => void; onNext: () => void }

export default function StepPersonal({ data, onChange, onNext }: Props) {
  const valid = data.first_name && data.last_name && data.email && data.phone && data.city && data.password.length >= 8

  return (
    <div className="p-5 flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold text-[#1D1D1F]">Informations personnelles</h2>
        <p className="text-sm text-gray-500 mt-1">Étape 1 sur 7</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#861D6D]" value={data.first_name} onChange={(e) => onChange({ first_name: e.target.value })} placeholder="Koffi" />
        </div>
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#861D6D]" value={data.last_name} onChange={(e) => onChange({ last_name: e.target.value })} placeholder="Adjovi" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Adresse email</label>
        <input type="email" className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#861D6D]" value={data.email} onChange={(e) => onChange({ email: e.target.value })} placeholder="koffi@email.com" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
        <input type="tel" className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#861D6D]" value={data.phone} onChange={(e) => onChange({ phone: e.target.value })} placeholder="+229 97 00 00 00" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
        <select className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#861D6D] bg-white" value={data.city} onChange={(e) => onChange({ city: e.target.value })}>
          <option value="">Sélectionnez votre ville</option>
          {['Cotonou', 'Porto-Novo', 'Parakou', 'Abomey-Calavi', 'Bohicon', 'Natitingou'].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
        <input type="password" className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#861D6D]" value={data.password} onChange={(e) => onChange({ password: e.target.value })} placeholder="8 caractères minimum" />
      </div>

      <button disabled={!valid} onClick={onNext} className="w-full bg-[#861D6D] disabled:bg-gray-300 text-white py-4 rounded-xl font-semibold text-lg mt-2 transition-colors">
        Continuer →
      </button>
    </div>
  )
}
