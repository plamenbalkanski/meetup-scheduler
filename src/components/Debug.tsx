'use client'

export function Debug({ data }: { data: any }) {
  return (
    <div style={{
      margin: '20px 0',
      padding: '20px',
      backgroundColor: 'yellow',
      border: '4px solid orange',
      borderRadius: '8px'
    }}>
      <h3 style={{ marginBottom: '10px', fontWeight: 'bold' }}>Debug Output:</h3>
      <pre style={{ 
        whiteSpace: 'pre-wrap',
        backgroundColor: 'white',
        padding: '10px',
        borderRadius: '4px'
      }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
} 