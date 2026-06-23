'use client'

import { useState } from 'react'

type Props = { loading: boolean; onSubmit: () => void }

export default function StepTerms({ loading, onSubmit }: Props) {
  const [accepted, setAccepted] = useState(false)

  return (
    <div className="p-5 flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold">Conditions d&apos;utilisation</h2>
        <p className="text-sm text-gray-500 mt-1">Étape 7 sur 7 — Dernière étape</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 h-48 overflow-y-auto text-xs text-gray-600 leading-relaxed">
        <p className="font-semibold mb-2">Conditions générales d&apos;utilisation — SpeedService Livreur</p>
        <p className="mb-2">En soumettant cette candidature, vous acceptez d&apos;être lié(e) aux présentes conditions :</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Vous garantissez l&apos;exactitude des informations et documents fournis.</li>
          <li>Vous acceptez les règles de conduite et de service de SpeedService.</li>
          <li>Vous autorisez SpeedService à vérifier vos documents d&apos;identité et de véhicule.</li>
          <li>Vous reconnaissez être un prestataire indépendant, non salarié.</li>
          <li>Vos données personnelles sont traitées conformément à notre politique de confidentialité.</li>
          <li>SpeedService se réserve le droit de suspendre ou résilier votre accès en cas de manquement.</li>
          <li>Tout litige sera soumis à la juridiction compétente du Bénin.</li>
        </ul>
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-0.5 w-5 h-5 rounded border-gray-300 text-[#861D6D] focus:ring-[#861D6D]" />
        <span className="text-sm text-gray-700">
          J&apos;ai lu et j&apos;accepte les <span className="text-[#861D6D] font-medium">conditions générales d&apos;utilisation</span> de SpeedService.
        </span>
      </label>

      <button
        disabled={!accepted || loading}
        onClick={onSubmit}
        className="w-full bg-[#861D6D] disabled:bg-gray-300 text-white py-4 rounded-xl font-semibold text-lg mt-2 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Envoi en cours…
          </>
        ) : (
          'Soumettre ma candidature ✓'
        )}
      </button>
    </div>
  )
}
