'use client'

import type { FormData, FileData } from '../page'

const VEHICLE_TYPES = [
  { value: 'bicycle', label: 'Vélo', icon: '🚲' },
  { value: 'motorcycle', label: 'Moto', icon: '🛵' },
  { value: 'car', label: 'Voiture', icon: '🚗' },
  { value: 'van', label: 'Camionnette', icon: '🚐' },
]

type Props = {
  data: FormData
  onChange: (p: Partial<FormData>) => void
  files: FileData
  onFilesChange: (p: Partial<FileData>) => void
  onNext: () => void
}

export default function StepVehicleInfo({ data, onChange, files, onFilesChange, onNext }: Props) {
  const needsPlate = data.vehicle_type !== 'bicycle'
  const valid = data.vehicle_type && (!needsPlate || (data.vehicle_brand && data.vehicle_plate))

  return (
    <div className="p-5 flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold">Votre véhicule</h2>
        <p className="text-sm text-gray-500 mt-1">Étape 3 sur 7</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {VEHICLE_TYPES.map(({ value, label, icon }) => (
          <button key={value} onClick={() => onChange({ vehicle_type: value })} className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${data.vehicle_type === value ? 'border-[#861D6D] bg-purple-50' : 'border-gray-200'}`}>
            <span className="text-3xl">{icon}</span>
            <span className="text-sm font-medium text-gray-700">{label}</span>
          </button>
        ))}
      </div>

      {needsPlate && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Marque</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#861D6D]" value={data.vehicle_brand} onChange={(e) => onChange({ vehicle_brand: e.target.value })} placeholder="Honda, Yamaha…" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de plaque</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#861D6D]" value={data.vehicle_plate} onChange={(e) => onChange({ vehicle_plate: e.target.value })} placeholder="AB 1234 BJ" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Photo du véhicule</label>
            <label className="block border-2 border-dashed border-gray-300 rounded-xl p-5 text-center cursor-pointer hover:border-[#861D6D]">
              {files.vehiclePhoto ? (
                <span className="text-sm text-[#861D6D] font-medium">{files.vehiclePhoto.name}</span>
              ) : (
                <span className="text-sm text-gray-400">Ajouter une photo</span>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onFilesChange({ vehiclePhoto: e.target.files[0] })} />
            </label>
          </div>
        </>
      )}

      <button disabled={!valid} onClick={onNext} className="w-full bg-[#861D6D] disabled:bg-gray-300 text-white py-4 rounded-xl font-semibold text-lg mt-2">
        Continuer →
      </button>
    </div>
  )
}
