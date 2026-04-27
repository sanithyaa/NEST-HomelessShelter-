'use client'

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { useState, useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import toast from 'react-hot-toast'
import { MapPin, Loader2 } from 'lucide-react'

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

function MapClickHandler({ 
  position, 
  setPosition, 
  onLocationChange 
}: { 
  position: [number, number]; 
  setPosition: (pos: [number, number]) => void;
  onLocationChange: (lat: number, lng: number) => void;
}) {
  const { setValue } = useFormContext()

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng
      setPosition([lat, lng])
      setValue('location', { lat, lng })
      onLocationChange(lat, lng)
      toast.success('Location updated')
    },
  })

  return <Marker position={position} />
}

export default function MapSelector() {
  const { setValue, watch } = useFormContext()
  const savedLocation = watch('location')
  const savedLocationName = watch('locationName')
  
  const [position, setPosition] = useState<[number, number]>([28.6139, 77.209])
  const [loading, setLoading] = useState(true)
  const [mapCenter, setMapCenter] = useState<[number, number]>([28.6139, 77.209])
  const [locationName, setLocationName] = useState<string>('')
  const [manualLat, setManualLat] = useState<string>('')
  const [manualLng, setManualLng] = useState<string>('')

  const fetchLocationName = async (lat: number, lng: number) => {
    try {
      console.log('Fetching location for:', lat, lng)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'NEST/1.0',
          },
        }
      )
      const data = await response.json()
      console.log('Location data:', data)
      
      if (data.display_name) {
        setLocationName(data.display_name)
        setValue('locationName', data.display_name)
      } else if (data.address) {
        const parts = []
        if (data.address.road) parts.push(data.address.road)
        if (data.address.suburb) parts.push(data.address.suburb)
        if (data.address.city) parts.push(data.address.city)
        if (data.address.state) parts.push(data.address.state)
        const name = parts.join(', ') || 'Location found'
        setLocationName(name)
        setValue('locationName', name)
      }
    } catch (error) {
      console.error('Error fetching location name:', error)
      setLocationName(`Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
    }
  }

  useEffect(() => {
    // Check if location is already saved in form
    if (savedLocation?.lat && savedLocation?.lng) {
      const newPos: [number, number] = [savedLocation.lat, savedLocation.lng]
      setPosition(newPos)
      setMapCenter(newPos)
      setManualLat(savedLocation.lat.toFixed(6))
      setManualLng(savedLocation.lng.toFixed(6))
      if (savedLocationName) {
        setLocationName(savedLocationName)
      } else {
        fetchLocationName(savedLocation.lat, savedLocation.lng)
      }
      setLoading(false)
      return
    }

    // Get user's current location only if not already saved
    if (navigator.geolocation) {
      const loadingToast = toast.loading('Getting your location...')
      
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords
          const newPos: [number, number] = [latitude, longitude]
          setPosition(newPos)
          setMapCenter(newPos)
          setManualLat(latitude.toFixed(6))
          setManualLng(longitude.toFixed(6))
          setValue('location', { lat: latitude, lng: longitude })
          await fetchLocationName(latitude, longitude)
          toast.dismiss(loadingToast)
          toast.success('Location detected!')
          setLoading(false)
        },
        (error) => {
          console.error('Geolocation error:', error)
          toast.dismiss(loadingToast)
          
          let errorMessage = 'Could not get location. '
          if (error.code === 1) {
            errorMessage += 'Permission denied. Please allow location access.'
          } else if (error.code === 2) {
            errorMessage += 'Position unavailable.'
          } else if (error.code === 3) {
            errorMessage += 'Request timeout.'
          }
          
          toast.error(errorMessage, { duration: 5000 })
          // Set default location
          const defaultLat = 28.6139
          const defaultLng = 77.209
          setManualLat(defaultLat.toFixed(6))
          setManualLng(defaultLng.toFixed(6))
          setValue('location', { lat: defaultLat, lng: defaultLng })
          fetchLocationName(defaultLat, defaultLng)
          setLoading(false)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      )
    } else {
      toast.error('Geolocation not supported by your browser')
      const defaultLat = 28.6139
      const defaultLng = 77.209
      setManualLat(defaultLat.toFixed(6))
      setManualLng(defaultLng.toFixed(6))
      setValue('location', { lat: defaultLat, lng: defaultLng })
      fetchLocationName(defaultLat, defaultLng)
      setLoading(false)
    }
  }, [setValue, savedLocation, savedLocationName])

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      const loadingToast = toast.loading('Getting your location...')
      
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords
          const newPos: [number, number] = [latitude, longitude]
          setPosition(newPos)
          setMapCenter(newPos)
          setManualLat(latitude.toFixed(6))
          setManualLng(longitude.toFixed(6))
          setValue('location', { lat: latitude, lng: longitude })
          await fetchLocationName(latitude, longitude)
          toast.dismiss(loadingToast)
          toast.success('Location updated!')
        },
        (error) => {
          toast.dismiss(loadingToast)
          let errorMessage = 'Could not get location'
          if (error.code === 1) {
            errorMessage = 'Location permission denied. Please enable in browser settings.'
          }
          toast.error(errorMessage, { duration: 5000 })
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      )
    }
  }

  const handleManualUpdate = () => {
    const lat = parseFloat(manualLat)
    const lng = parseFloat(manualLng)
    
    if (isNaN(lat) || isNaN(lng)) {
      toast.error('Invalid coordinates')
      return
    }
    
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toast.error('Coordinates out of range')
      return
    }
    
    const newPos: [number, number] = [lat, lng]
    setPosition(newPos)
    setMapCenter(newPos)
    setValue('location', { lat, lng })
    fetchLocationName(lat, lng)
    toast.success('Location updated from coordinates')
  }

  const handleLocationNameChange = (newName: string) => {
    setLocationName(newName)
    setValue('locationName', newName)
  }

  if (loading) {
    return (
      <div className="h-96 bg-tan dark:bg-dark-surface rounded-xl flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-amber animate-spin mx-auto mb-2" />
          <p className="text-brown dark:text-dark-muted">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative space-y-3">
      <button
        type="button"
        onClick={handleGetLocation}
        className="btn-secondary flex items-center gap-2 w-full sm:w-auto"
      >
        <MapPin className="w-4 h-4" />
        Use My Current Location
      </button>

      <MapContainer
        center={mapCenter}
        zoom={15}
        className="h-64 md:h-96 rounded-xl z-0"
        style={{ height: '400px' }}
        key={`${mapCenter[0]}-${mapCenter[1]}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler 
          position={position} 
          setPosition={setPosition}
          onLocationChange={fetchLocationName}
        />
      </MapContainer>
      
      <div className="bg-tan dark:bg-dark-surface p-4 rounded-xl space-y-3">
        <div>
          <label className="block text-sm font-medium text-deepbrown dark:text-dark-text mb-2">
            📍 Location Name
          </label>
          <input
            type="text"
            value={locationName}
            onChange={(e) => handleLocationNameChange(e.target.value)}
            placeholder="Enter location name"
            className="input w-full"
          />
          <p className="text-xs text-brown/70 dark:text-dark-muted mt-1">
            Edit the location name if needed
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-deepbrown dark:text-dark-text mb-1">
              Latitude
            </label>
            <input
              type="text"
              value={manualLat}
              onChange={(e) => setManualLat(e.target.value)}
              placeholder="28.6139"
              className="input w-full text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-deepbrown dark:text-dark-text mb-1">
              Longitude
            </label>
            <input
              type="text"
              value={manualLng}
              onChange={(e) => setManualLng(e.target.value)}
              placeholder="77.2090"
              className="input w-full text-sm"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleManualUpdate}
          className="btn-secondary w-full text-sm"
        >
          Update from Coordinates
        </button>

        <p className="text-xs text-brown/70 dark:text-dark-muted">
          💡 Click anywhere on the map to change the location, or manually edit coordinates above
        </p>
      </div>
    </div>
  )
}

