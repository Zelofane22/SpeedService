'use client'

import type { FileData } from '../page'

type Props = { files: FileData; onChange: (p: Partial<FileData>) => void; onNext: () => void }

export default function StepVehicleDocs({ files, onChange, onNext }: Props) {
  const set = (key: keyof FileData['vehicleDocs'], file: File) =>
    onChange({ vehicleDocs: { ...files.vehicleDocs, [key]: file } })

  const valid = files.vehicleDocs.license && files.vehicleDocs.registration && files.vehicleDocs.insurance

  const docs: Array<{ key: keyof FileData['vehicleDocs']; label: string }> = [
    { key: 'license', label: 'Permis de conduire' },
    { key: 'registration', label: 'Carte grise' },
    { key: 'insurance', label: 'Attestation d\'assurance' },
  ]

  return (
    <div className="p-5 flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold">Documents du véhicule</h2>
        <p className="text-sm text-gray-500 mt-1">Étape 4 sur 7</p>
      </div>

      {docs.map(({ key, label }) => (
        <div key={key}>
          <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
          <label className="block border-2 border-dashed border-gray-300 rounded-xl p-5 text-center cursor-pointer hover:border-[#861D6D] transition-colors">
            {files.vehicleDocs[key] ? (
              <span className="text-sm text-[#861D6D] font-medium">{files.vehicleDocs[key]?.name}</span>
            ) : (
              <span className="text-sm text-gray-400">Ajouter {label.toLowerCase()}</span>
            )}
            <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => e.target.files?.[0] && set(key, e.target.files[0])} />
          </label>
        </div>
      ))}

      <button disabled={!valid} onClick={onNext} className="w-full bg-[#861D6D] disabled:bg-gray-300 text-white py-4 rounded-xl font-semibold text-lg mt-2">
        Continuer →
      </button>
    </div>
  )
}
