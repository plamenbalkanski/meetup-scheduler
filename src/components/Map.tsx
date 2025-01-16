'use client'

interface MapProps {
  address: string
  className?: string
}

export function Map({ address, className = "" }: MapProps) {
  // Always show debug info
  return (
    <div className="space-y-4">
      {/* Debug info */}
      <div className="p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
        <p className="text-sm font-mono">
          Map Debug: address = "{address || 'none'}"
        </p>
      </div>

      {/* Actual map/link component */}
      {address ? (
        <div className={`w-full p-4 bg-white rounded-lg border-4 border-blue-400 ${className}`}>
          <a 
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 flex items-center justify-center gap-2"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              className="w-5 h-5"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
              />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
              />
            </svg>
            <span className="underline font-medium">{address}</span>
          </a>
        </div>
      ) : (
        <div className="p-4 bg-red-50 border-2 border-red-400 rounded-lg">
          <p className="text-red-600 text-center">No address provided</p>
        </div>
      )}
    </div>
  )
} 