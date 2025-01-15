'use client'

import { useEffect, useRef } from 'react'
import { FEATURES } from '@/lib/features'

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

interface MapProps {
  address: string
  className?: string
}

export function Map({ address, className = "" }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  
  if (!FEATURES.MAP_ENABLED) {
    return (
      <div className={`w-full p-4 bg-gray-100 rounded-lg ${className}`}>
        <p className="text-gray-600 text-center">{address}</p>
      </div>
    )
  }

  useEffect(() => {
    if (!mapRef.current) return

    // Load Google Maps script
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
    script.async = true
    script.onload = initMap
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [address])

  const initMap = () => {
    if (!mapRef.current) return

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
  }

  return (
    <div 
      ref={mapRef} 
      className={`w-full h-64 rounded-lg overflow-hidden ${className}`}
    />
  )
} 