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
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <Toaster position="bottom-right" />
      </body>
    </html>
  )
} 