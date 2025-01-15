'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    google: typeof google
  }
}

interface MapProps {
  address: string
  className?: string
}

export function Map({ address, className = "" }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  
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
    geocoder.geocode({ address }, (
      results: google.maps.GeocoderResult[] | null,
      status: google.maps.GeocoderStatus
    ) => {
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
    })
  }

  return (
    <div 
      ref={mapRef} 
      className={`w-full h-64 rounded-lg overflow-hidden ${className}`}
    />
  )
} 