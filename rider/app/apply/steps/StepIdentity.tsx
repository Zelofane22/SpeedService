'use client'

import { useState } from 'react'
import type { FileData } from '../page'

type Props = { files: FileData; onChange: (p: Partial<FileData>) => void; onNext: () => void }

export default function StepIdentity({ files, onChange, onNext }: Props) {
  const [docType, setDocType] = useState<'national_id' | 'passport'>(files.identity.type)

  const setType = (t: 'national_id' | 'passport') => {
    setDocType(t)
    onChange({ identity: { ...files.identity, type: t } })
  }

  const setFront = (f: File) => onChange({ identity: { ...files.identity, front: f } })
  const setBack = (f: File) => onChange({ identity: { ...files.identity, back: f } })

  const valid = files.identity.front && (docType === 'passport' || files.identity.back)

  return (
    <div className="p-5 flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold">Pièce d&apos;identité</h2>
        <p className="text-sm text-gray-500 mt-1">Étape 2 sur 7</p>
      </div>

      <div className="flex gap-2">
        {(['national_id', 'passport'] as const).map((t) => (
          <button key={t} onClick={() => setType(t)} className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${docType === t ? 'bg-[#861D6D] text-white border-[#861D6D]' : 'border-gray-200 text-gray-600'}`}>
            {t === 'national_id' ? 'CNI' : 'Passeport'}
          </button>
        ))}
      </div>

      <FileUploadBox label={docType === 'national_id' ? 'Recto CNI' : 'Page photo'} file={files.identity.front} onFile={setFront} />
      {docType === 'national_id' && (
        <FileUploadBox label="Verso CNI" file={files.identity.back} onFile={setBack} />
      )}

      <button disabled={!valid} onClick={onNext} className="w-full bg-[#861D6D] disabled:bg-gray-300 text-white py-4 rounded-xl font-semibold text-lg mt-2">
        Continuer →
      </button>
    </div>
  )
}

function FileUploadBox({ label, file, onFile }: { label: string; file?: File; onFile: (f: File) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <label className="block border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-[#861D6D] transition-colors">
        {file ? (
          <span className="text-sm text-[#861D6D] font-medium">{file.name}</span>
        ) : (
          <span className="text-sm text-gray-400">Appuyer pour ajouter une photo</span>
        )}
        <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
      </label>
    </div>
  )
}
