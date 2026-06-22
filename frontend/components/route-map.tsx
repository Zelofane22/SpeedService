'use client'

import { type ComponentType } from 'react'
import dynamic from 'next/dynamic'

export interface RouteMapProps {
  pickup:     { lat: number; lon: number }
  delivery:   { lat: number; lon: number }
  distanceKm: number
}

const Loading = () => (
  <div className="rounded-2xl h-[276px] bg-brand-muted/50 flex items-center justify-center border border-brand-border">
    <p className="text-sm text-primary-400">Chargement de la carte…</p>
  </div>
)

const RouteMapInner = dynamic(
  () =>
    import('./route-map-inner') as unknown as Promise<{ default: ComponentType<RouteMapProps> }>,
  { ssr: false, loading: Loading },
)

export default function RouteMap(props: RouteMapProps) {
  return <RouteMapInner {...props} />
}
