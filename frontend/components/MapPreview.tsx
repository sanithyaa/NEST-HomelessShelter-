'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface MapPreviewProps {
  lat: number
  lng: number
  locationName?: string
}

export default function MapPreview({ lat, lng, locationName }: MapPreviewProps) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={14}
      className="h-[150px] rounded-xl z-0"
      scrollWheelZoom={false}
      dragging={false}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]}>
        {locationName && (
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{locationName}</p>
              <p className="text-xs text-gray-600 mt-1">
                {lat.toFixed(6)}, {lng.toFixed(6)}
              </p>
            </div>
          </Popup>
        )}
      </Marker>
    </MapContainer>
  )
}
