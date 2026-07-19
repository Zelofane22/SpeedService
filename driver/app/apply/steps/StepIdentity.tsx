'use client'

import { useEffect, useState } from 'react'
import type { FileData } from '../page'
import { DOCUMENT_ACCEPT, DOCUMENT_ACCEPT_LABEL, humanFileSize, validateUploadFile } from '../validation'

type Props = { files: FileData; onChange: (p: Partial<FileData>) => void; onNext: () => void }

export default function StepIdentity({ files, onChange, onNext }: Props) {
  const [docType, setDocType] = useState<'national_id' | 'passport'>(files.identity.type)

  const setType = (t: 'national_id' | 'passport') => {
    setDocType(t)
    onChange({ identity: t === 'passport' ? { front: files.identity.front, type: t } : { ...files.identity, type: t } })
  }

  const setFront = (f?: File) => onChange({ identity: { ...files.identity, front: f } })
  const setBack = (f?: File) => onChange({ identity: { ...files.identity, back: f } })

  const valid = files.identity.front && (docType === 'passport' || files.identity.back)

  return (
    <div className="p-5 flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold">Pièce d&apos;identité</h2>
        <p className="text-sm text-gray-500 mt-1">Étape 2 sur 7</p>
      </div>

      <div className="flex gap-2">
        {(['national_id', 'passport'] as const).map((t) => (
          <button key={t} type="button" onClick={() => setType(t)} className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${docType === t ? 'bg-[#861D6D] text-white border-[#861D6D]' : 'border-gray-200 text-gray-600'}`}>
            {t === 'national_id' ? 'CNI' : 'Passeport'}
          </button>
        ))}
      </div>

      <FileUploadBox id="identity-front" label={docType === 'national_id' ? 'Recto CNI' : 'Page photo'} file={files.identity.front} onFile={setFront} />
      {docType === 'national_id' && (
        <FileUploadBox id="identity-back" label="Verso CNI" file={files.identity.back} onFile={setBack} />
      )}

      {!valid && <p className="text-sm text-red-700" role="status">Ajoutez {docType === 'national_id' ? 'le recto et le verso de votre CNI' : 'la page photo de votre passeport'}.</p>}

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
    if (!validationError) onFile(candidate)
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
          <span className="text-sm text-gray-400">Appuyer pour ajouter une photo</span>
        )}
        <input id={id} type="file" required accept={DOCUMENT_ACCEPT} className="sr-only" aria-describedby={`${id}-help${error ? ` ${id}-error` : ''}`} onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </label>
      <p id={`${id}-help`} className="mt-1 text-xs text-gray-500">{DOCUMENT_ACCEPT_LABEL}</p>
      {error && <p id={`${id}-error`} className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  )
}
