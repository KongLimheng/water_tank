import axios from 'axios'
import L, { LeafletMouseEvent } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from 'react-leaflet'

// --- IMAGE FIX START ---
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})
// --- IMAGE FIX END ---

interface LocationData {
  lat: number
  lng: number
  address: string
}

// --- ICONS ---
const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
)
const LocationIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
  </svg>
)

const ModernLocationPicker: React.FC = () => {
  const [location, setLocation] = useState<LocationData | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState('')

  const markerRef = useRef<L.Marker>(null)
  const mapRef = useRef<L.Map | null>(null)

  // --- HELPER: Fetch Address ---
  const fetchAddress = async (lat: number, lng: number) => {
    setLoading(true)
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse`,
        {
          params: {
            format: 'json',
            lat,
            lon: lng,
            zoom: 18,
            addressdetails: 1,
          },
        }
      )
      setLocation({
        lat,
        lng,
        address: response.data.display_name,
      })
    } catch (error) {
      console.error('Failed to fetch address', error)
    } finally {
      setLoading(false)
    }
  }

  // --- NEW: Run on Mount to get User Location ---
  useEffect(() => {
    if ('geolocation' in navigator) {
      setLoading(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          fetchAddress(latitude, longitude)

          // Wait a small moment for map to initialize before flying
          setTimeout(() => {
            if (mapRef.current) {
              mapRef.current.flyTo([latitude, longitude], 15)
            }
          }, 500)
        },
        (error) => {
          console.warn('Geolocation denied or failed on load:', error)
          setLoading(false)
          // Optional: Set default fallback location (e.g., London)
        }
      )
    }
  }, []) // Empty dependency array = runs only once

  // --- HANDLER: Search ---
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery) return
    setLoading(true)

    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search`,
        {
          params: { q: searchQuery, format: 'json', limit: 1 },
        }
      )

      if (response.data && response.data.length > 0) {
        const { lat, lon, display_name } = response.data[0]
        const newLat = parseFloat(lat)
        const newLng = parseFloat(lon)
        setLocation({ lat: newLat, lng: newLng, address: display_name })
        if (mapRef.current) mapRef.current.flyTo([newLat, newLng], 14)
      } else {
        alert('Location not found')
      }
    } catch (error) {
      console.error('Search failed', error)
    } finally {
      setLoading(false)
    }
  }

  // --- HANDLER: Manual "Locate Me" Button ---
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported')
      return
    }
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        fetchAddress(latitude, longitude)
        if (mapRef.current) mapRef.current.flyTo([latitude, longitude], 15)
      },
      () => {
        setLoading(false)
        alert('Unable to retrieve your location. Please allow access.')
      }
    )
  }

  // --- COMPONENTS ---
  const DraggableMarker = () => {
    const eventHandlers = useMemo(
      () => ({
        dragend() {
          const marker = markerRef.current
          if (marker) {
            const { lat, lng } = marker.getLatLng()
            fetchAddress(lat, lng)
          }
        },
      }),
      []
    )

    if (!location) return null

    return (
      <Marker
        draggable={true}
        eventHandlers={eventHandlers}
        position={{ lat: location.lat, lng: location.lng }}
        ref={markerRef}
      >
        <Popup minWidth={90}>
          <span>{loading ? 'Loading...' : 'You are here!'}</span>
        </Popup>
      </Marker>
    )
  }

  const MapClickHandler = () => {
    useMapEvents({
      click(e: LeafletMouseEvent) {
        fetchAddress(e.latlng.lat, e.latlng.lng)
      },
    })
    return null
  }

  const handleSave = async () => {
    if (!location) return
    setSaveStatus('Saving...')
    try {
      await axios.post('http://localhost:5000/api/location', {
        ...location,
        timestamp: new Date().toISOString(),
      })
      setSaveStatus('Success!')
      setTimeout(() => setSaveStatus(''), 3000)
    } catch (e) {
      setSaveStatus('Error saving.')
    }
  }

  return (
    <div
      style={{ fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}
    >
      {/* Search Bar */}
      <div style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
        <form
          onSubmit={handleSearch}
          style={{ flex: 1, display: 'flex', gap: '5px' }}
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search address..."
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #ccc',
            }}
          />
          <button type="submit" style={btnStyle} disabled={loading}>
            <SearchIcon />
          </button>
        </form>
        <button
          onClick={handleLocateMe}
          style={btnStyle}
          title="Use my location"
        >
          <LocationIcon />
        </button>
      </div>

      {/* Map */}
      <div
        style={{
          height: '450px',
          width: '100%',
          borderRadius: '12px',
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid #ddd',
        }}
      >
        <MapContainer
          center={[51.505, -0.09] as L.LatLngExpression}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler />
          <DraggableMarker />
        </MapContainer>

        {loading && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(255,255,255,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 999,
              fontWeight: 'bold',
            }}
          >
            Finding location...
          </div>
        )}
      </div>

      {/* Footer Details */}
      {location && (
        <div
          style={{
            marginTop: '15px',
            padding: '15px',
            background: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
          }}
        >
          <p>
            <strong>Address:</strong> {location.address}
          </p>
          <p style={{ fontSize: '14px', color: '#666' }}>
            {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
          </p>
          <button
            onClick={handleSave}
            style={{ ...primaryBtnStyle, marginTop: '10px', width: '100%' }}
            disabled={loading}
          >
            {saveStatus || 'Confirm Location'}
          </button>
        </div>
      )}
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  padding: '10px',
  background: '#fff',
  border: '1px solid #ccc',
  borderRadius: '8px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
}
const primaryBtnStyle: React.CSSProperties = {
  padding: '12px',
  background: '#2563eb',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 600,
}

export default ModernLocationPicker
