import { Toaster } from 'react-hot-toast'
import { ErrorBoundary } from '../components/ErrorBoundary'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script
          async
          defer
          data-website-id="YOUR-WEBSITE-ID"
          src="https://your-umami-app.onrender.com/script.js"
        />
      </head>
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <Toaster position="bottom-right" />
      </body>
    </html>
  )
} 