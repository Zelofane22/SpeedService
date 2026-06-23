'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { submitComplement } from '@/lib/api'

type DocEntry = { type: string; file: File | null }

const DOC_TYPES = [
  { value: 'national_id_front', label: 'CNI Recto' },
  { value: 'national_id_back', label: 'CNI Verso' },
  { value: 'passport', label: 'Passeport' },
  { value: 'driver_license', label: 'Permis de conduire' },
  { value: 'vehicle_registration_card', label: 'Carte grise' },
  { value: 'insurance', label: 'Attestation d\'assurance' },
  { value: 'vehicle_photo', label: 'Photo du véhicule' },
  { value: 'profile_photo', label: 'Photo de profil' },
]

function ComplementContent() {
  const params = useSearchParams()
  const router = useRouter()
  const applicationId = params.get('id') ?? ''

  const [docs, setDocs] = useState<DocEntry[]>([{ type: '', file: null }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addDoc = () => setDocs((d) => [...d, { type: '', file: null }])

  const updateDoc = (i: number, partial: Partial<DocEntry>) =>
    setDocs((d) => d.map((doc, idx) => idx === i ? { ...doc, ...partial } : doc))

  const valid = applicationId && docs.every((d) => d.type && d.file)

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('application_id', applicationId)
      docs.forEach((doc, i) => {
        fd.append(`documents[${i}][type]`, doc.type)
        if (doc.file) fd.append(`documents[${i}][file]`, doc.file)
      })
      await submitComplement(fd)
      router.push(`/apply/status?id=${applicationId}`)
    } catch {
      setError('Une erreur est survenue. Vérifiez votre référence et réessayez.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7FB]">
      <header className="bg-[#861D6D] text-white px-5 py-4 flex items-center gap-3">
        <Link href={`/apply/status?id=${applicationId}`} className="text-white/80 hover:text-white">←</Link>
        <span className="font-semibold">Documents complémentaires</span>
      </header>

      <div className="p-5 flex flex-col gap-4">
        <p className="text-sm text-gray-600">
          Ajoutez les documents demandés par l&apos;équipe SpeedService pour finaliser votre candidature.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">{error}</div>
        )}

        {docs.map((doc, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type de document</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#861D6D]" value={doc.type} onChange={(e) => updateDoc(i, { type: e.target.value })}>
                <option value="">Sélectionnez…</option>
                {DOC_TYPES.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fichier</label>
              <label className="block border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-[#861D6D]">
                {doc.file ? (
                  <span className="text-sm text-[#861D6D] font-medium">{doc.file.name}</span>
                ) : (
                  <span className="text-sm text-gray-400">Appuyer pour ajouter</span>
                )}
                <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => e.target.files?.[0] && updateDoc(i, { file: e.target.files[0] })} />
              </label>
            </div>
          </div>
        ))}

        <button onClick={addDoc} className="text-[#861D6D] text-sm font-medium border border-[#861D6D] rounded-xl py-3 text-center">
          + Ajouter un document
        </button>

        <button disabled={!valid || loading} onClick={handleSubmit} className="w-full bg-[#861D6D] disabled:bg-gray-300 text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2">
          {loading ? (
            <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Envoi…</>
          ) : 'Envoyer les documents'}
        </button>
      </div>
    </div>
  )
}

export default function ComplementPage() {
  return (
    <Suspense>
      <ComplementContent />
    </Suspense>
  )
}
