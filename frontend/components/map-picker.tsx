'use client'

import { type ComponentType } from 'react'
import dynamic from 'next/dynamic'
import type { GeoPoint } from '@/components/map-picker-inner'

export type { GeoPoint }

export interface MapPickerProps {
  value: GeoPoint | null
  onChange: (point: GeoPoint) => void
  label?: string
}

const Loading = () => (
  <div className="rounded-2xl h-[272px] bg-brand-muted/50 flex items-center justify-center border border-brand-border">
    <p className="text-sm text-gray-700">Chargement de la carte…</p>
  </div>
)

const MapPickerInner = dynamic(
  () =>
    import('./map-picker-inner') as unknown as Promise<{ default: ComponentType<MapPickerProps> }>,
  { ssr: false, loading: Loading },
)

export default function MapPicker(props: MapPickerProps) {
  return <MapPickerInner {...props} />
}
