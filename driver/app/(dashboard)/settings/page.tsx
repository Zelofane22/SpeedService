'use client'

import { Palette } from 'lucide-react'
import { ThemeToggle } from '@speedservice/ui'

export default function SettingsPage() {
  return (
    <div className="px-5 pb-6 pt-5">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#1D1D1F]">Paramètres</h1>
      </div>

      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#861D6D]/10 text-[#861D6D]">
            <Palette size={18} aria-hidden="true" />
          </div>
          <h2 className="text-base font-bold text-[#1D1D1F]">Apparence</h2>
        </div>

        <div className="p-4">
          <ThemeToggle />
        </div>
      </section>
    </div>
  )
}
