'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const ICON_PICKUP = L.icon({
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize:    [25, 41],
  iconAnchor:  [12, 41],
  popupAnchor: [1, -34],
  shadowSize:  [41, 41],
})

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (positions.length === 2) {
      map.fitBounds(positions, { padding: [40, 40] })
    }
  }, [map, positions])
  return null
}

interface Props {
  pickup:   { lat: number; lon: number }
  delivery: { lat: number; lon: number }
  distanceKm: number
}

export default function RouteMapInner({ pickup, delivery, distanceKm }: Props) {
  const pickupPos:   [number, number] = [pickup.lat, pickup.lon]
  const deliveryPos: [number, number] = [delivery.lat, delivery.lon]

  return (
    <div className="flex flex-col gap-2">
      <div className="h-60 overflow-hidden rounded-2xl border border-brand-border sm:h-[240px]">
        <MapContainer
          center={pickupPos}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds positions={[pickupPos, deliveryPos]} />
          <Marker position={pickupPos} icon={ICON_PICKUP} />
          <Marker position={deliveryPos} icon={ICON_PICKUP} />
          <Polyline
            positions={[pickupPos, deliveryPos]}
            pathOptions={{ color: '#861D6D', weight: 3, dashArray: '8 6' }}
          />
        </MapContainer>
      </div>
      <div className="flex items-center justify-between gap-3 bg-primary/5 border border-primary/20 rounded-2xl px-4 py-3 text-sm">
        <span className="text-gray-700">Distance estimée</span>
        <span className="font-bold text-primary">{distanceKm.toFixed(1)} km</span>
      </div>
      <p className="text-xs text-gray-700">
        Distance à vol d&apos;oiseau × 1,3 — trajet réel peut varier.
      </p>
    </div>
  )
}
