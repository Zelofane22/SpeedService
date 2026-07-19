'use client'

import { useEffect, useState } from 'react'
import type { FormData, FileData } from '../page'
import { getVehicleErrors, humanFileSize, IMAGE_ACCEPT, IMAGE_ACCEPT_LABEL, validateUploadFile } from '../validation'

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
  const errors = getVehicleErrors(data, files)
  const valid = data.vehicle_type && errors.length === 0

  const selectVehicle = (value: string) => {
    onChange({
      vehicle_type: value,
      ...(value === 'bicycle' ? { vehicle_brand: '', vehicle_plate: '' } : {}),
    })
    if (value === 'bicycle') onFilesChange({ vehiclePhoto: undefined, vehicleDocs: {} })
  }

  return (
    <div className="p-5 flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold">Votre véhicule</h2>
        <p className="text-sm text-gray-500 mt-1">Étape 3 sur 7</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {VEHICLE_TYPES.map(({ value, label, icon }) => (
          <button key={value} type="button" aria-pressed={data.vehicle_type === value} onClick={() => selectVehicle(value)} className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${data.vehicle_type === value ? 'border-[#861D6D] bg-purple-50' : 'border-gray-200'}`}>
            <span className="text-3xl">{icon}</span>
            <span className="text-sm font-medium text-gray-700">{label}</span>
          </button>
        ))}
      </div>

      {needsPlate && (
        <>
          <div>
            <label htmlFor="vehicle-brand" className="block text-sm font-medium text-gray-700 mb-1">Marque</label>
            <input
              id="vehicle-brand"
              name="vehicle-brand"
              required
              maxLength={80}
              autoComplete="off"
              className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#861D6D]"
              value={data.vehicle_brand}
              onChange={(e) => onChange({ vehicle_brand: e.target.value })}
              placeholder="Honda, Yamaha…"
            />
          </div>
          <div>
            <label htmlFor="vehicle-plate" className="block text-sm font-medium text-gray-700 mb-1">Numéro de plaque</label>
            <input
              id="vehicle-plate"
              name="vehicle-plate"
              required
              maxLength={30}
              autoComplete="off"
              className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-[#861D6D]"
              value={data.vehicle_plate}
              onChange={(e) => onChange({ vehicle_plate: e.target.value.toUpperCase() })}
              placeholder="AB 1234 BJ"
            />
          </div>

          <VehiclePhotoUpload file={files.vehiclePhoto} onFile={(file) => onFilesChange({ vehiclePhoto: file })} />
        </>
      )}

      {!valid && <p className="text-sm text-red-700" role="status">{errors[0]}</p>}

      <button type="button" disabled={!valid} onClick={onNext} className="w-full bg-[#861D6D] disabled:bg-gray-300 text-white py-4 rounded-xl font-semibold text-lg mt-2">
        Continuer →
      </button>
    </div>
  )
}

function VehiclePhotoUpload({ file, onFile }: { file?: File; onFile: (file?: File) => void }) {
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputId = 'vehicle-photo'

  useEffect(() => {
    if (!file) {
      setPreview(null)
      return
    }

    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const handleFile = (candidate: File) => {
    const validationError = validateUploadFile(candidate, 'image')
    setError(validationError)
    if (validationError) {
      onFile(undefined)
      return
    }
    onFile(candidate)
  }

  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">Photo du véhicule</label>
      <label htmlFor={inputId} className="block border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-[#861D6D] transition-colors">
        {file ? (
          <span className="flex flex-col items-center gap-2 text-sm text-[#861D6D] font-medium">
            {preview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Aperçu de la photo du véhicule" className="h-32 w-full rounded-lg object-cover" />
            )}
            <span>{file.name}</span>
            <span className="text-xs text-gray-500">{humanFileSize(file.size)}</span>
          </span>
        ) : (
          <span className="text-sm text-gray-400">Ajouter une photo</span>
        )}
        <input id={inputId} type="file" required accept={IMAGE_ACCEPT} className="sr-only" aria-describedby={`${inputId}-help${error ? ` ${inputId}-error` : ''}`} onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </label>
      <p id={`${inputId}-help`} className="mt-1 text-xs text-gray-500">{IMAGE_ACCEPT_LABEL}</p>
      {error && <p id={`${inputId}-error`} className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  )
}
