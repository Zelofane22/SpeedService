'use client'

import { Search } from 'lucide-react'

interface SearchInputProps {
  placeholder?: string
  value: string
  onChange: (v: string) => void
}

export function SearchInput({ placeholder, value, onChange }: SearchInputProps) {
  return (
    <div className="relative">
      <Search
        size={15}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? 'Rechercher...'}
        aria-label={placeholder ?? 'Rechercher'}
        className="min-h-11 w-full rounded-xl border border-border bg-input-background py-2.5 pl-9 pr-4 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  )
}

export default SearchInput
