import { useState } from 'react'

function ScanPage({ onBack }) {
  const [fileName, setFileName] = useState('')

  const handleFile = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setFileName(file.name)
  }

  return (
    <main style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <button onClick={onBack}>← Torna alla Home</button>

      <h1>Scansiona Bolla</h1>

      <p>
        Carica una foto o un PDF della bolla del fornitore.
      </p>

      <div
        style={{
          marginTop: '30px',
          padding: '40px',
          border: '2px dashed #2f8f83',
          borderRadius: '18px',
          background: 'white',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '50px', marginBottom: '15px' }}>📷</div>

        <h2>Carica documento</h2>

        <p>
          Puoi scegliere una foto oppure un file PDF.
        </p>

        <input
          type="file"
          accept="image/*,.pdf"
          onChange={handleFile}
        />

        {fileName && (
          <p style={{ marginTop: '20px' }}>
            File selezionato: <strong>{fileName}</strong>
          </p>
        )}
      </div>
    </main>
  )
}

export default ScanPage