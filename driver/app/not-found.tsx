import Link from 'next/link'
import { Bike, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#FAF7FB] px-5 py-8 text-[#1D1D1F]">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center">
        <div className="rounded-2xl border border-[#E8D7E7] bg-white p-6 shadow-sm">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#861D6D] text-white">
            <Bike className="h-7 w-7" aria-hidden="true" />
          </div>

          <p className="text-sm font-semibold text-[#861D6D]">Page introuvable</p>
          <h1 className="mt-2 text-2xl font-bold text-[#1D1D1F]">Cette page n’existe pas.</h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            Le lien est peut-être incomplet ou la page a été déplacée.
          </p>

          <Link
            href="/"
            className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#861D6D] px-5 py-3 text-sm font-semibold text-white"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            Retour à l’accueil
          </Link>
        </div>
      </div>
    </main>
  )
}

