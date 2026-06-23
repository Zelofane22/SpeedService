'use client'

import { useState } from 'react'
import { applyDriver, uploadDocuments } from '@/lib/api'
import StepPersonal from './steps/StepPersonal'
import StepIdentity from './steps/StepIdentity'
import StepVehicleInfo from './steps/StepVehicleInfo'
import StepVehicleDocs from './steps/StepVehicleDocs'
import StepPayment from './steps/StepPayment'
import StepProfilePhoto from './steps/StepProfilePhoto'
import StepTerms from './steps/StepTerms'
import StepSuccess from './steps/StepSuccess'

export type FormData = {
  // Step 1
  first_name: string
  last_name: string
  email: string
  phone: string
  city: string
  password: string
  // Step 3
  vehicle_type: string
  vehicle_brand: string
  vehicle_plate: string
  // Step 5
  payment_method: string
  payment_number: string
  bank_name: string
  bank_iban: string
}

export type FileData = {
  identity: { front?: File; back?: File; type: 'national_id' | 'passport' }
  vehiclePhoto?: File
  vehicleDocs: { license?: File; registration?: File; insurance?: File }
  profilePhoto?: File
}

const TOTAL_STEPS = 7

export default function ApplyPage() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>({
    first_name: '', last_name: '', email: '', phone: '', city: '', password: '',
    vehicle_type: 'motorcycle', vehicle_brand: '', vehicle_plate: '',
    payment_method: 'mtn_momo', payment_number: '', bank_name: '', bank_iban: '',
  })
  const [files, setFiles] = useState<FileData>({
    identity: { type: 'national_id' },
    vehicleDocs: {},
  })
  const [applicationId, setApplicationId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS + 1))
  const prev = () => setStep((s) => Math.max(s - 1, 1))

  const updateForm = (partial: Partial<FormData>) =>
    setForm((f) => ({ ...f, ...partial }))
  const updateFiles = (partial: Partial<FileData>) =>
    setFiles((f) => ({ ...f, ...partial }))

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      const { application_id } = await applyDriver({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        city: form.city,
        vehicle_type: form.vehicle_type,
        vehicle_brand: form.vehicle_brand,
        vehicle_plate: form.vehicle_plate,
        payment_method: form.payment_method,
        payment_number: form.payment_number,
        bank_name: form.bank_name,
        bank_iban: form.bank_iban,
      })

      setApplicationId(application_id)

      // Upload documents
      const fd = new FormData()
      fd.append('application_id', application_id)
      let idx = 0

      const addFile = (file: File, type: string) => {
        fd.append(`documents[${idx}][type]`, type)
        fd.append(`documents[${idx}][file]`, file)
        idx++
      }

      if (files.identity.front) addFile(files.identity.front, `${files.identity.type}_front`)
      if (files.identity.back) addFile(files.identity.back, `${files.identity.type}_back`)
      if (files.vehiclePhoto) addFile(files.vehiclePhoto, 'vehicle_photo')
      if (files.vehicleDocs.license) addFile(files.vehicleDocs.license, 'driver_license')
      if (files.vehicleDocs.registration) addFile(files.vehicleDocs.registration, 'vehicle_registration_card')
      if (files.vehicleDocs.insurance) addFile(files.vehicleDocs.insurance, 'insurance')
      if (files.profilePhoto) addFile(files.profilePhoto, 'profile_photo')

      if (idx > 0) await uploadDocuments(fd)

      next() // → StepSuccess
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err
        ? String((err as { message: unknown }).message)
        : 'Une erreur est survenue. Veuillez réessayer.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const requiresVehicleDocs = form.vehicle_type !== 'bicycle'

  if (step === TOTAL_STEPS + 1) {
    return <StepSuccess applicationId={applicationId!} email={form.email} />
  }

  const progress = (step / TOTAL_STEPS) * 100

  return (
    <div className="min-h-screen bg-[#FAF7FB] flex flex-col">
      {/* Header */}
      <header className="bg-[#861D6D] text-white px-5 py-4 flex items-center gap-3">
        {step > 1 && (
          <button onClick={prev} className="mr-1 text-white/80 hover:text-white" aria-label="Retour">
            ←
          </button>
        )}
        <span className="font-semibold flex-1">Candidature livreur</span>
        <span className="text-sm text-white/70">{step}/{TOTAL_STEPS}</span>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-white/30">
        <div
          className="h-full bg-white transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto">
        {error && (
          <div className="mx-4 mt-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
            {error}
          </div>
        )}

        {step === 1 && <StepPersonal data={form} onChange={updateForm} onNext={next} />}
        {step === 2 && <StepIdentity files={files} onChange={updateFiles} onNext={next} />}
        {step === 3 && <StepVehicleInfo data={form} onChange={updateForm} files={files} onFilesChange={updateFiles} onNext={next} />}
        {step === 4 && (
          requiresVehicleDocs
            ? <StepVehicleDocs files={files} onChange={updateFiles} onNext={next} />
            : (() => { next(); return null })()
        )}
        {step === 5 && <StepPayment data={form} onChange={updateForm} onNext={next} />}
        {step === 6 && <StepProfilePhoto files={files} onChange={updateFiles} onNext={next} />}
        {step === 7 && <StepTerms loading={loading} onSubmit={handleSubmit} />}
      </div>
    </div>
  )
}
