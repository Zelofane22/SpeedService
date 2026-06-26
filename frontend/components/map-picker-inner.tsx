'use client'

import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Leaflet's default icons break in bundlers — point to CDN assets instead
const DEFAULT_ICON = L.icon({
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize:    [25, 41],
  iconAnchor:  [12, 41],
  popupAnchor: [1, -34],
  shadowSize:  [41, 41],
})
L.Marker.prototype.options.icon = DEFAULT_ICON

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api'

// Cotonou, Bénin
const DEFAULT_CENTER: [number, number] = [6.3676, 2.4252]
const DEFAULT_ZOOM = 13

export type GeoPoint = { lat: number; lon: number; address: string }

// Flies to a new position when `target` changes
function FlyTo({ target }: { target: [number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (target) map.flyTo(target, 16, { duration: 1 })
  }, [target, map])
  return null
}

function ClickHandler({ onPick }: { onPick: (lat: number, lon: number) => void }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) })
  return null
}

interface Props {
  value: GeoPoint | null
  onChange: (point: GeoPoint) => void
  label?: string
}

export default function MapPickerInner({ value, onChange, label }: Props) {
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [searching, setSearching] = useState(false)
  const [searchErr, setSearchErr] = useState<string | null>(null)
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null)

  async function reverseGeocode(lat: number, lon: number): Promise<string> {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
        { headers: { 'Accept-Language': 'fr' } },
      )
      if (!res.ok) return `${lat.toFixed(5)}, ${lon.toFixed(5)}`
      const data = await res.json()
      return (data.display_name as string) ?? `${lat.toFixed(5)}, ${lon.toFixed(5)}`
    } catch {
      return `${lat.toFixed(5)}, ${lon.toFixed(5)}`
    }
  }

  async function handleMapClick(lat: number, lon: number) {
    const address = await reverseGeocode(lat, lon)
    onChange({ lat, lon, address })
    if (searchInputRef.current) searchInputRef.current.value = address
  }

  async function handleSearch() {
    const q = searchInputRef.current?.value.trim() ?? ''
    if (!q) return
    setSearching(true)
    setSearchErr(null)
    try {
      const res = await fetch(`${BASE_URL}/geo/geocode?q=${encodeURIComponent(q)}`, {
        headers: { Accept: 'application/json' },
      })
      const results = await res.json()
      if (!res.ok || !Array.isArray(results) || results.length === 0) {
        setSearchErr('Adresse introuvable. Essayez un quartier ou une ville.')
        return
      }
      const { lat, lon, display_name } = results[0] as { lat: number; lon: number; display_name: string }
      onChange({ lat, lon, address: display_name })
      if (searchInputRef.current) searchInputRef.current.value = display_name
      setFlyTarget([lat, lon])
    } catch {
      setSearchErr('Erreur de connexion.')
    } finally {
      setSearching(false)
    }
  }

  // Keep input in sync when parent resets value
  useEffect(() => {
    if (searchInputRef.current) searchInputRef.current.value = value?.address ?? ''
  }, [value?.address])

  return (
    <div className="flex flex-col gap-2">
      {label && <p className="text-xs text-gray-700">{label}</p>}

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          ref={searchInputRef}
          type="text"
          defaultValue={value?.address ?? ''}
          onChange={() => setSearchErr(null)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              void handleSearch()
            }
          }}
          placeholder="Quartier, rue… puis appuyez sur Localiser"
          className="min-w-0 flex-1 bg-brand-input border border-brand-border rounded-xl px-3 py-2 text-sm placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching}
          className="w-full px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:opacity-90 disabled:opacity-60 transition-all sm:w-auto sm:shrink-0"
        >
          {searching ? '…' : 'Localiser'}
        </button>
      </div>

      {searchErr && <p className="text-xs text-red-500">{searchErr}</p>}

      <div className="h-60 overflow-hidden rounded-2xl border border-brand-border sm:h-[220px]">
        <MapContainer
          center={value ? [value.lat, value.lon] : DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onPick={handleMapClick} />
          <FlyTo target={flyTarget} />
          {value && <Marker position={[value.lat, value.lon]} />}
        </MapContainer>
      </div>

      {value ? (
        <p className="text-xs text-gray-700 truncate">
          <span className="font-medium text-primary">Sélectionné : </span>{value.address}
        </p>
      ) : (
        <p className="text-xs text-gray-700">Cliquez sur la carte ou utilisez la recherche.</p>
      )}
    </div>
  )
}
