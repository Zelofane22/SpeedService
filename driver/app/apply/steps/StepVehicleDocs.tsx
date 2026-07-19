'use client'

import { useEffect, useState } from 'react'
import type { FileData } from '../page'
import { DOCUMENT_ACCEPT, DOCUMENT_ACCEPT_LABEL, getVehicleDocsErrors, humanFileSize, validateUploadFile } from '../validation'

type Props = { files: FileData; onChange: (p: Partial<FileData>) => void; onNext: () => void }

export default function StepVehicleDocs({ files, onChange, onNext }: Props) {
  const set = (key: keyof FileData['vehicleDocs'], file?: File) =>
    onChange({ vehicleDocs: { ...files.vehicleDocs, [key]: file } })

  const errors = getVehicleDocsErrors(files, 'motorcycle')
  const valid = errors.length === 0

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
        <FileUploadBox key={key} id={`vehicle-doc-${key}`} label={label} file={files.vehicleDocs[key]} onFile={(file) => set(key, file)} />
      ))}

      {!valid && <p className="text-sm text-red-700" role="status">{errors[0]}</p>}

      <button type="button" disabled={!valid} onClick={onNext} className="w-full bg-[#861D6D] disabled:bg-gray-300 text-white py-4 rounded-xl font-semibold text-lg mt-2">
        Continuer →
      </button>
    </div>
  )
}

function FileUploadBox({ id, label, file, onFile }: { id: string; label: string; file?: File; onFile: (f?: File) => void }) {
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!file || !file.type.startsWith('image/')) {
      setPreview(null)
      return
    }

    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const handleFile = (candidate: File) => {
    const validationError = validateUploadFile(candidate, 'document')
    setError(validationError)
    if (validationError) {
      onFile(undefined)
      return
    }
    onFile(candidate)
  }

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <label htmlFor={id} className="block border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-[#861D6D] transition-colors">
        {file ? (
          <span className="flex flex-col items-center gap-2 text-sm text-[#861D6D] font-medium">
            {preview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt={`Aperçu ${label.toLowerCase()}`} className="h-28 w-full rounded-lg object-cover" />
            )}
            <span>{file.name}</span>
            <span className="text-xs text-gray-500">{humanFileSize(file.size)}</span>
          </span>
        ) : (
          <span className="text-sm text-gray-400">Ajouter {label.toLowerCase()}</span>
        )}
        <input id={id} type="file" required accept={DOCUMENT_ACCEPT} className="sr-only" aria-describedby={`${id}-help${error ? ` ${id}-error` : ''}`} onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </label>
      <p id={`${id}-help`} className="mt-1 text-xs text-gray-500">{DOCUMENT_ACCEPT_LABEL}</p>
      {error && <p id={`${id}-error`} className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  )
}
