'use client'

import { useEffect, useRef, useState } from 'react'
import { FEATURES } from '@/lib/features'

// Add back the type definitions
declare global {
  interface Window {
    google: {
      maps: {
        Geocoder: new () => {
          geocode: (
            request: { address: string },
            callback: (
              results: Array<{
                geometry: {
                  location: { lat: () => number; lng: () => number }
                }
              }> | null,
              status: string
            ) => void
          ) => void
        }
        Map: new (
          element: HTMLElement,
          options: { center: any; zoom: number }
        ) => any
        Marker: new (options: { map: any; position: any }) => any
      }
    }
  }
}

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

interface MapProps {
  address: string
  className?: string
}

export function Map({ address, className = "" }: MapProps) {
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