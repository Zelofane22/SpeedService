import Link from 'next/link'

type Props = { applicationId: string; email: string }

export default function StepSuccess({ applicationId, email }: Props) {
  return (
    <div className="min-h-screen bg-[#FAF7FB] flex flex-col items-center justify-center px-6 text-center gap-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl">✅</div>
      <div>
        <h1 className="text-2xl font-bold text-[#1D1D1F]">Candidature envoyée !</h1>
        <p className="text-gray-600 mt-2 leading-relaxed">
          Un email de confirmation a été envoyé à <strong>{email}</strong>.<br />
          Notre équipe examinera votre dossier dans les 48 heures.
        </p>
      </div>

      <div className="bg-white rounded-xl p-4 border border-gray-200 w-full max-w-xs text-left">
        <p className="text-xs text-gray-500 mb-1">Référence de candidature</p>
        <p className="text-sm font-mono font-medium text-[#861D6D] break-all">{applicationId}</p>
      </div>

      <Link
        href={`/apply/status?id=${applicationId}`}
        className="w-full max-w-xs bg-[#861D6D] text-white py-4 rounded-xl font-semibold text-center block"
      >
        Suivre ma candidature
      </Link>
      <Link href="/" className="text-sm text-gray-500 underline">
        Retour à l&apos;accueil
      </Link>
    </div>
  )
}
