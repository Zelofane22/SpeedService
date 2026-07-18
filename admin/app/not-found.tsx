'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Home, SearchX } from 'lucide-react'
import DashboardLayout from './(dashboard)/layout'

export default function NotFound() {
  const router = useRouter()

  return (
    <DashboardLayout>
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 text-center shadow-sm sm:p-8">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <SearchX size={26} aria-hidden="true" />
          </div>
          <p className="text-sm font-semibold text-primary">Erreur 404</p>
          <h1 className="mt-2 text-2xl font-bold text-foreground">
            Page introuvable
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
            Cette adresse ne correspond à aucune page de l&apos;espace admin SpeedService.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              <Home size={16} aria-hidden="true" />
              Retour au dashboard
            </Link>
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted/20 hover:text-foreground"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Page précédente
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
