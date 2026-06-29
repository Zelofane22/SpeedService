'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Props = { applicationId: string; email: string }

type Phase = 'idle' | 'circle' | 'check' | 'content'

export default function StepSuccess({ applicationId, email }: Props) {
  const [phase, setPhase] = useState<Phase>('idle')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('circle'), 80)
    const t2 = setTimeout(() => setPhase('check'), 480)
    const t3 = setTimeout(() => setPhase('content'), 900)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  return (
    <div className="min-h-screen bg-[#FAF7FB] flex flex-col items-center justify-center px-6 text-center gap-6">
      <style>{`
        @keyframes ss-scale-in {
          0%   { transform: scale(0); opacity: 0; }
          65%  { transform: scale(1.18); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes ss-draw-check {
          to { stroke-dashoffset: 0; }
        }
        @keyframes ss-fade-up {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ss-pulse-ring {
          0%   { transform: scale(0.85); opacity: 0.5; }
          100% { transform: scale(1.5);  opacity: 0; }
        }
        .ss-circle-in {
          animation: ss-scale-in 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .ss-check {
          stroke-dasharray: 80;
          stroke-dashoffset: 80;
          animation: ss-draw-check 0.38s ease-out 0.08s forwards;
        }
        .ss-fade-up {
          opacity: 0;
          animation: ss-fade-up 0.45s ease-out forwards;
        }
        .ss-pulse {
          animation: ss-pulse-ring 1.4s ease-out 0.2s infinite;
        }
      `}</style>

      {/* Animated checkmark */}
      <div className="relative flex items-center justify-center w-24 h-24">
        {phase !== 'idle' && (
          <div className="absolute inset-0 rounded-full bg-green-300 ss-pulse" />
        )}
        {phase !== 'idle' && (
          <div className="relative w-20 h-20 bg-green-100 rounded-full flex items-center justify-center ss-circle-in">
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden>
              {(phase === 'check' || phase === 'content') && (
                <polyline
                  points="9,23 18,32 35,13"
                  stroke="#16a34a"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ss-check"
                />
              )}
            </svg>
          </div>
        )}
      </div>

      {phase === 'content' && (
        <>
          <div className="ss-fade-up" style={{ animationDelay: '0ms' }}>
            <h1 className="text-2xl font-bold text-[#1D1D1F]">Candidature envoyée !</h1>
            <p className="text-gray-600 mt-2 leading-relaxed">
              Un email de confirmation a été envoyé à <strong>{email}</strong>.<br />
              Notre équipe examinera votre dossier dans les 48 heures.
            </p>
          </div>

          <div
            className="bg-white rounded-xl p-4 border border-gray-200 w-full max-w-xs text-left ss-fade-up"
            style={{ animationDelay: '80ms' }}
          >
            <p className="text-xs text-gray-500 mb-1">Référence de candidature</p>
            <p className="text-sm font-mono font-medium text-[#861D6D] break-all">{applicationId}</p>
          </div>

          <Link
            href={`/apply/status?id=${applicationId}`}
            className="w-full max-w-xs bg-[#861D6D] text-white py-4 rounded-xl font-semibold text-center block ss-fade-up"
            style={{ animationDelay: '160ms' }}
          >
            Suivre ma candidature
          </Link>
          <Link
            href="/"
            className="text-sm text-gray-500 underline ss-fade-up"
            style={{ animationDelay: '240ms' }}
          >
            Retour à l&apos;accueil
          </Link>
        </>
      )}
    </div>
  )
}
