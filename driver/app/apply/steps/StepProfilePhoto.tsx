'use client'

import { useEffect, useState } from 'react'
import type { FileData } from '../page'
import { humanFileSize, IMAGE_ACCEPT, IMAGE_ACCEPT_LABEL, validateUploadFile } from '../validation'

type Props = { files: FileData; onChange: (p: Partial<FileData>) => void; onNext: () => void }

export default function StepProfilePhoto({ files, onChange, onNext }: Props) {
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!files.profilePhoto) {
      setPreview(null)
      return
    }

    const url = URL.createObjectURL(files.profilePhoto)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [files.profilePhoto])

  const handleFile = (f: File) => {
    const validationError = validateUploadFile(f, 'image')
    setError(validationError)
    if (validationError) {
      onChange({ profilePhoto: undefined })
      return
    }

    onChange({ profilePhoto: f })
  }

  return (
    <div className="p-5 flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold">Photo de profil</h2>
        <p className="text-sm text-gray-500 mt-1">Étape 6 sur 7 — Selfie de face, fond neutre</p>
      </div>

      <label htmlFor="profile-photo" className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-[#861D6D] transition-colors">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Aperçu" className="w-32 h-32 rounded-full object-cover border-4 border-[#861D6D]" />
        ) : (
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-4xl">👤</div>
            <span className="text-sm">Appuyer pour prendre un selfie</span>
          </div>
        )}
        <input id="profile-photo" type="file" required accept={IMAGE_ACCEPT} capture="user" className="sr-only" aria-describedby={`profile-photo-help${error ? ' profile-photo-error' : ''}`} onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </label>
      <p id="profile-photo-help" className="text-xs text-gray-500 text-center">{IMAGE_ACCEPT_LABEL}</p>

      {files.profilePhoto && (
        <p className="text-xs text-gray-500 text-center">{files.profilePhoto.name} · {humanFileSize(files.profilePhoto.size)}</p>
      )}

      {error && <p id="profile-photo-error" className="text-xs text-red-700 text-center">{error}</p>}

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
        💡 Conseils : visage bien éclairé, regard vers la caméra, sans lunettes de soleil ni couvre-chef.
      </div>

      {!files.profilePhoto && <p className="text-sm text-red-700" role="status">Ajoutez une photo de profil pour continuer.</p>}

      <button type="button" disabled={!files.profilePhoto} onClick={onNext} className="w-full bg-[#861D6D] disabled:bg-gray-300 text-white py-4 rounded-xl font-semibold text-lg mt-2">
        Continuer →
      </button>
    </div>
  )
}
