'use client'

import { useEffect, useRef, useState } from 'react'
import { FEATURES } from '@/lib/features'

// Move script loading to a separate function
const loadGoogleMapsScript = (callback: () => void) => {
  const existingScript = document.getElementById('google-maps-script')
  if (existingScript) {
    callback()
    return
  }

  const script = document.createElement('script')
  script.id = 'google-maps-script'
  script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
  script.async = true
  script.defer = true
  script.crossOrigin = "anonymous"
  
  script.onload = callback
  script.onerror = () => {
    console.error('Failed to load Google Maps script')
  }
  
  document.head.appendChild(script)
}

export function Map({ address, className = "" }: { address: string, className?: string }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    if (!mapRef.current || !FEATURES.MAP_ENABLED) return
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      setError('Google Maps API key is not configured')
      return
    }

    loadGoogleMapsScript(() => {
      const geocoder = new window.google.maps.Geocoder()
      geocoder.geocode(
        { address },
        (results, status) => {
          if (status === 'OK' && results?.[0]) {
            const map = new window.google.maps.Map(mapRef.current!, {
              center: results[0].geometry.location,
              zoom: 15,
            })

            new window.google.maps.Marker({
              map,
              position: results[0].geometry.location,
            })
          }
        }
      )
    })

    return () => {
      const script = document.getElementById('google-maps-script')
      if (script) {
        script.remove()
      }
    }
  }, [address])

  if (!FEATURES.MAP_ENABLED) {
    return (
      <div className={`w-full p-4 bg-gray-100 rounded-lg ${className}`}>
        <p className="text-gray-600 text-center">{address}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`w-full p-4 bg-red-50 rounded-lg ${className}`}>
        <p className="text-red-600 text-center">{error}</p>
      </div>
    )
  }

  return (
    <div 
      ref={mapRef} 
      className={`w-full h-64 rounded-lg overflow-hidden ${className}`}
    />
  )
} 