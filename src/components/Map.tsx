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
  // Check if script is already loaded
  if (window.google?.maps) {
    callback()
    return
  }

  // Check if script is already being loaded
  const existingScript = document.getElementById('google-maps-script')
  if (existingScript) {
    existingScript.addEventListener('load', callback)
    return
  }

  // Create new script element
  const script = document.createElement('script')
  script.id = 'google-maps-script'
  script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
  script.async = true
  script.defer = true
  
  // Add CORS attributes
  script.crossOrigin = "anonymous"
  script.referrerPolicy = "no-referrer"
  
  // Add event listeners
  script.addEventListener('load', callback)
  script.addEventListener('error', () => {
    console.error('Failed to load Google Maps script')
    document.head.removeChild(script)
  })
  
  // Append script to head
  document.head.appendChild(script)
}

interface MapProps {
  address: string
  className?: string
}

export function Map({ address, className = "" }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    if (!mapRef.current || !FEATURES.MAP_ENABLED) return
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      setError('Google Maps API key is not configured')
      setIsLoading(false)
      return
    }

    let isMounted = true

    loadGoogleMapsScript(() => {
      if (!isMounted) return

      try {
        const geocoder = new window.google.maps.Geocoder()
        geocoder.geocode(
          { address },
          (results, status) => {
            if (!isMounted) return

            if (status === 'OK' && results?.[0]) {
              const map = new window.google.maps.Map(mapRef.current!, {
                center: results[0].geometry.location,
                zoom: 15,
              })

              new window.google.maps.Marker({
                map,
                position: results[0].geometry.location,
              })
            } else {
              setError(`Failed to load map: ${status}`)
            }
            setIsLoading(false)
          }
        )
      } catch (err) {
        if (isMounted) {
          console.error('Map error:', err)
          setError('Failed to initialize map')
          setIsLoading(false)
        }
      }
    })

    return () => {
      isMounted = false
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

  if (isLoading) {
    return (
      <div className={`w-full h-64 flex items-center justify-center bg-gray-50 rounded-lg ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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