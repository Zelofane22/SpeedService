import type { FileData, FormData } from './page'

export const PHONE_PATTERN = '^(?:\\+229\\s?)?01(?:[\\s.-]?\\d{2}){4}$'
export const PHONE_HELP = 'Format attendu : +229 01 97 00 00 00.'
export const DOCUMENT_ACCEPT = 'image/jpeg,image/png,application/pdf'
export const IMAGE_ACCEPT = 'image/jpeg,image/png'
export const DOCUMENT_ACCEPT_LABEL = 'JPG, PNG ou PDF, 5 Mo maximum.'
export const IMAGE_ACCEPT_LABEL = 'JPG ou PNG, 5 Mo maximum.'
export const MAX_UPLOAD_SIZE = 5 * 1024 * 1024

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i
const BENIN_PHONE_PATTERN = /^(?:\+229\s?)?01(?:[\s.-]?\d{2}){4}$/
const BANK_ACCOUNT_PATTERN = /^[A-Za-z0-9\s-]{8,34}$/

export function isValidEmail(value: string) {
  return EMAIL_PATTERN.test(value.trim())
}

export function isValidBeninPhone(value: string) {
  return BENIN_PHONE_PATTERN.test(value.trim())
}

export function isValidBankAccount(value: string) {
  return BANK_ACCOUNT_PATTERN.test(value.trim())
}

export function getPersonalErrors(data: FormData) {
  const errors: string[] = []
  if (data.first_name.trim().length < 2) errors.push('Le prénom doit contenir au moins 2 caractères.')
  if (data.last_name.trim().length < 2) errors.push('Le nom doit contenir au moins 2 caractères.')
  if (!isValidEmail(data.email)) errors.push('Saisissez une adresse email valide.')
  if (!isValidBeninPhone(data.phone)) errors.push(PHONE_HELP)
  if (!data.city) errors.push('Sélectionnez votre ville.')
  if (data.password.length < 8) errors.push('Le mot de passe doit contenir au moins 8 caractères.')
  return errors
}

export function getVehicleErrors(data: FormData, files: FileData) {
  if (data.vehicle_type === 'bicycle') return []

  const errors: string[] = []
  if (!data.vehicle_brand.trim()) errors.push('La marque du véhicule est obligatoire.')
  if (!data.vehicle_plate.trim()) errors.push('Le numéro de plaque est obligatoire.')
  if (!files.vehiclePhoto) errors.push('La photo du véhicule est obligatoire.')
  return errors
}

export function getVehicleDocsErrors(files: FileData, vehicleType: string) {
  if (vehicleType === 'bicycle') return []

  const errors: string[] = []
  if (!files.vehicleDocs.license) errors.push('Ajoutez votre permis de conduire.')
  if (!files.vehicleDocs.registration) errors.push('Ajoutez votre carte grise.')
  if (!files.vehicleDocs.insurance) errors.push('Ajoutez votre attestation d’assurance.')
  return errors
}

export function getPaymentErrors(data: FormData) {
  const errors: string[] = []

  if (!data.payment_method) {
    errors.push('Choisissez une méthode de paiement.')
    return errors
  }

  if (data.payment_method === 'mtn_momo' || data.payment_method === 'moov_money') {
    if (!isValidBeninPhone(data.payment_number)) errors.push(PHONE_HELP)
  } else if (data.payment_method === 'bank') {
    if (!data.bank_name.trim()) errors.push('Le nom de la banque est obligatoire.')
    if (!isValidBankAccount(data.bank_iban)) {
      errors.push('Saisissez un IBAN ou numéro de compte valide, entre 8 et 34 caractères.')
    }
  }

  return errors
}

export function validateUploadFile(file: File, kind: 'document' | 'image') {
  const accepted = kind === 'image'
    ? ['image/jpeg', 'image/png']
    : ['image/jpeg', 'image/png', 'application/pdf']

  if (!accepted.includes(file.type)) {
    return kind === 'image' ? IMAGE_ACCEPT_LABEL : DOCUMENT_ACCEPT_LABEL
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    return 'Le fichier doit faire 5 Mo maximum.'
  }

  return null
}

export function humanFileSize(size: number) {
  const mb = size / (1024 * 1024)
  return `${mb.toFixed(mb >= 1 ? 1 : 2)} Mo`
}

export function mapApplicationError(err: unknown) {
  const knownMessages: Record<string, string> = {
    'validation.email': 'L’adresse email n’est pas valide.',
    'validation.required': 'Un champ obligatoire est manquant.',
    'validation.unique': 'Cette adresse email est déjà utilisée.',
    'validation.min.string': 'Le champ renseigné est trop court.',
    'validation.max.string': 'Le champ renseigné est trop long.',
  }

  const translate = (message: unknown) => {
    if (typeof message !== 'string') return null
    return knownMessages[message] ?? (message.startsWith('validation.') ? 'Certaines informations sont invalides.' : message)
  }

  if (err && typeof err === 'object') {
    const payload = err as { message?: unknown; errors?: Record<string, unknown> }
    const fieldErrors = payload.errors
    if (fieldErrors && typeof fieldErrors === 'object') {
      const first = Object.values(fieldErrors)[0]
      const message = Array.isArray(first) ? translate(first[0]) : translate(first)
      if (message) return message
    }

    const message = translate(payload.message)
    if (message) return message
  }

  return 'Une erreur est survenue. Veuillez réessayer.'
}

export function getApplicationErrorStep(err: unknown) {
  if (!err || typeof err !== 'object') return null

  const errors = (err as { errors?: Record<string, unknown> }).errors
  if (!errors || typeof errors !== 'object') return null

  const firstField = Object.keys(errors)[0] ?? ''
  if (['first_name', 'last_name', 'email', 'phone', 'city'].includes(firstField)) return 1
  if (firstField.startsWith('documents')) return 2
  if (['vehicle_type', 'vehicle_brand', 'vehicle_plate'].includes(firstField)) return 3
  if (['payment_method', 'payment_number', 'bank_name', 'bank_iban'].includes(firstField)) return 5

  return null
}
