'use client'

import { useState } from 'react'
import type { FileData } from '../page'

type Props = { files: FileData; onChange: (p: Partial<FileData>) => void; onNext: () => void }

export default function StepProfilePhoto({ files, onChange, onNext }: Props) {
  const [preview, setPreview] = useState<string | null>(null)

  const handleFile = (f: File) => {
    onChange({ profilePhoto: f })
    setPreview(URL.createObjectURL(f))
  }

  return (
    <div className="p-5 flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold">Photo de profil</h2>
        <p className="text-sm text-gray-500 mt-1">Étape 6 sur 7 — Selfie de face, fond neutre</p>
      </div>

      <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-8 cursor-pointer hover:border-[#861D6D] transition-colors">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Aperçu" className="w-32 h-32 rounded-full object-cover border-4 border-[#861D6D]" />
        ) : (
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-4xl">👤</div>
            <span className="text-sm">Appuyer pour prendre un selfie</span>
          </div>
        )}
        <input type="file" accept="image/*" capture="user" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </label>

      {files.profilePhoto && (
        <p className="text-xs text-gray-400 text-center">{files.profilePhoto.name}</p>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
        💡 Conseils : visage bien éclairé, regard vers la caméra, sans lunettes de soleil ni couvre-chef.
      </div>

      <button disabled={!files.profilePhoto} onClick={onNext} className="w-full bg-[#861D6D] disabled:bg-gray-300 text-white py-4 rounded-xl font-semibold text-lg mt-2">
        Continuer →
      </button>
    </div>
  )
}
