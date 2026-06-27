'use client'

import { Palette } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:space-y-8 sm:p-6">
      <div>
        <h1 className="text-xl font-bold text-brand-foreground sm:text-2xl">Paramètres</h1>
      </div>

      <section className="rounded-2xl border border-brand-border bg-white p-5 shadow-sm shadow-primary/5 sm:p-8">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Palette size={18} aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-brand-foreground">Apparence</h2>
            <ThemeToggle className="mt-5 sm:max-w-sm" />
          </div>
        </div>
      </section>
    </div>
  )
}
