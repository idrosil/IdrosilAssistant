import { useState } from 'react'
import { createWorker } from 'tesseract.js'

function ScanPage({ onBack }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [rotation, setRotation] = useState(0)
  const [cropTop, setCropTop] = useState(0)
const [cropBottom, setCropBottom] = useState(0)
const [cropLeft, setCropLeft] = useState(0)
const [cropRight, setCropRight] = useState(0)
  const [text, setText] = useState('')
  const [items, setItems] = useState([])
 const [materials, setMaterials] = useState(() => {
  const saved = localStorage.getItem('idrosilMaterials')
  return saved ? JSON.parse(saved) : []
})
const [supplier, setSupplier] = useState('')
const [otherSupplier, setOtherSupplier] = useState('')
const selectedSupplier =
  supplier === 'ALTRO' ? otherSupplier.trim() : supplier
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')

  const handleFile = (event) => {
  const selectedFile = event.target.files?.[0]
  if (!selectedFile) return

  setFile(selectedFile)
  const imageUrl = URL.createObjectURL(selectedFile)
setPreview(imageUrl)
  setRotation(0)
  setText('')
  setError('')
  setProgress(0)
}

  const rotateRight = () => {
    setRotation((value) => (value + 90) % 360)
  }

  const rotateLeft = () => {
    setRotation((value) => (value - 90 + 360) % 360)
  }

  const prepareImage = async () => {
    const bitmap = await createImageBitmap(file)

    const sideways = rotation === 90 || rotation === 270
const maxSize = 1600
const originalWidth = sideways ? bitmap.height : bitmap.width
const originalHeight = sideways ? bitmap.width : bitmap.height
const scale = Math.min(1, maxSize / originalWidth)

const canvas = document.createElement('canvas')
canvas.width = Math.round(originalWidth * scale)
canvas.height = Math.round(originalHeight * scale)

    const ctx = canvas.getContext('2d')

    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((rotation * Math.PI) / 180)

    ctx.drawImage(
      bitmap,
     -(bitmap.width * scale) / 2,
-(bitmap.height * scale) / 2,
bitmap.width * scale,
bitmap.height * scale
    )
const cropY = Math.round(canvas.height * (cropTop / 100))
const cropHeight = Math.round(canvas.height * (1 - cropTop / 100 - cropBottom / 100))

const croppedCanvas = document.createElement('canvas')
croppedCanvas.width = canvas.width
croppedCanvas.height = cropHeight

const croppedCtx = croppedCanvas.getContext('2d')

croppedCtx.drawImage(
  canvas,
  0,
  cropY,
  canvas.width,
  cropHeight,
  0,
  0,
  canvas.width,
  cropHeight
)
    return croppedCanvas
  }
const parseItems = (ocrText) => {
  const lines = ocrText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  const parsed = []

for (let i = 0; i < lines.length; i++) {
  const line = lines[i]

  if (/^[A-Z0-9]{5,}/.test(line) && /\d/.test(line)) {
    let fullLine = line

    if (i + 1 < lines.length && !/^[A-Z0-9]{5,}/.test(lines[i + 1])) {
      fullLine += ' ' + lines[i + 1]
    }

    const cleanLine = fullLine
  .replace(/,\s+/g, ',')
  .replace(/\s+/g, ' ')
  .trim()

const numberPattern = /\d+[.,]\d+|\d+/

const numbers = cleanLine.match(new RegExp(numberPattern, 'g')) || []

const codeMatch = cleanLine.match(/^[A-Z0-9]{5,}/)
const code = codeMatch?.[0] || ''

const umMatch = cleanLine.match(/\b(NR|MT|M|PZ|KG|LT|CF)\b/i)
const um = umMatch?.[0]?.toUpperCase() || ''

const quantity = numbers.length >= 4 ? numbers[numbers.length - 4] : ''
const listPrice = numbers.length >= 3 ? numbers[numbers.length - 3] : ''
const discount = numbers.length >= 2 ? numbers[numbers.length - 2] : ''
const total = numbers.length >= 1 ? numbers[numbers.length - 1] : ''

const qtyNumber = Number(String(quantity).replace(',', '.'))
const totalNumber = Number(String(total).replace(',', '.'))

const netUnitPrice =
  qtyNumber > 0 && !Number.isNaN(totalNumber)
    ? (totalNumber / qtyNumber).toFixed(2).replace('.', ',')
    : ''

const description = cleanLine
  .replace(code, '')
  .replace(/\b(NR|MT|M|PZ|KG|LT|CF)\b/i, '')
  .trim()

const matchedMaterial = materials.find(
  (material) =>
    String(material.lastCode || '').trim().toUpperCase() ===
    code.trim().toUpperCase()
)

parsed.push({
  id: parsed.length + 1,
  raw: cleanLine,
  code,
  matchedMaterial: matchedMaterial || null,
  description,
  um,
  quantity,
  price: netUnitPrice,
  listPrice,
  discount,
  total,
  iva: '',
})
  }
}

  setItems(parsed)
  }
  const addNewMaterial = (item) => {const alreadyExists = materials.some(
  (material) =>
    String(material.lastCode || '').trim().toUpperCase() ===
    String(item.code || '').trim().toUpperCase()
)

if (alreadyExists) {
  return
}
  const newMaterial = {
    id: `MAT-${Date.now()}`,
    name: item.description || '',
    aliases: '',
    category: '',
   suppliers: selectedSupplier,
lastSupplier: selectedSupplier,
    lastCode: item.code || '',
    lastCost: item.price || '',
    averageCost: item.price || '',
    minimumCost: item.price || '',
    maximumCost: item.price || '',
    suggestedPrice: '',
    purchaseCount: 1,
    supplierCodes: item.code || '',
    supplierPrices: [
  {
    supplier: selectedSupplier,
    code: item.code || '',
    price: item.price || '',
  },
],
    status: 'Attivo',
  }
  const updateMaterialPrice = (item) => {
  const updatedMaterials = materials.map((material) =>
    String(material.lastCode || '').trim().toUpperCase() ===
    String(item.code || '').trim().toUpperCase()
      ? {
          ...material,
    lastSupplier: selectedSupplier,
    lastCost: item.price || material.lastCost,
    supplierPrices: [
      ...(material.supplierPrices || []).filter(
        (entry) => entry.supplier !== selectedSupplier
      ),
      {
        supplier: selectedSupplier,
        code: item.code || '',
        price: item.price || '',
      },
    ],
  }
      : material
  )

  setMaterials(updatedMaterials)
  localStorage.setItem('idrosilMaterials', JSON.stringify(updatedMaterials))

  setItems((currentItems) =>
    currentItems.map((currentItem) =>
      currentItem.id === item.id
        ? {
            ...currentItem,
            matchedMaterial: {
              ...currentItem.matchedMaterial,
              lastCost: item.price,
            },
          }
        : currentItem
    )
  )
}

  const updatedMaterials = [...materials, newMaterial]

  setMaterials(updatedMaterials)
  localStorage.setItem('idrosilMaterials', JSON.stringify(updatedMaterials))
  setItems((currentItems) =>
  currentItems.map((currentItem) =>
    currentItem.id === item.id
      ? { ...currentItem, matchedMaterial: newMaterial }
      : currentItem
  )
)
}

  const readDocument = async () => {
    if (!file) return

    try {
      setLoading(true)
      setError('')
      setText('')
      setProgress(0)

      const canvas = await prepareImage()

      const worker = await createWorker('ita', 1, {
        logger: (message) => {
          if (typeof message.progress === 'number') {
            setProgress(Math.round(message.progress * 100))
          }
        },
      })

      const result = await worker.recognize(canvas)

      setText(result.data.text)
      parseItems(result.data.text)
      await worker.terminate()
    } catch (err) {
      console.error(err)
      setError(err?.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      style={{
        padding: '24px',
        maxWidth: '1000px',
        margin: '0 auto',
      }}
    >
      <button onClick={onBack}>
        ← Torna alla Home
      </button>

      <h1>Scansiona Bolla</h1>

      <p>
        Scatta o seleziona una foto, raddrizzala e poi avvia la lettura.
      </p>

      <div
        style={{
          marginTop: '25px',
          padding: '25px',
          background: 'white',
          border: '2px dashed #2f8f83',
          borderRadius: '18px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '48px' }}>📷</div>
<div style={{ marginBottom: '16px' }}>
  <label><strong>Fornitore:</strong></label>
  <select
    value={supplier}
    onChange={(e) => setSupplier(e.target.value)}
    style={{ marginLeft: '10px', padding: '8px' }}
  >
    <option value="">Seleziona fornitore</option>
    <option value="STIP">STIP</option>
    <option value="ASTORI">ASTORI</option>
    <option value="AGRIFER">AGRIFER</option>
    <option value="ALTRO">Altro</option>
  </select>{supplier === 'ALTRO' && (
  <input
    type="text"
    value={otherSupplier}
    onChange={(e) => setOtherSupplier(e.target.value)}
    placeholder="Nome fornitore"
    style={{ marginLeft: '10px', padding: '8px' }}
  />
)}
</div>
        <div className="scan-source-buttons">
  <label>
    📷 Scatta foto
    
    <input
      type="file"
      accept="image/*"
      capture="environment"
      onChange={handleFile}
      style={{ display: 'none' }}
    />
  </label>

  <label>
    📁 Scegli file
    <input
      type="file"
      accept="image/*"
      onChange={handleFile}
      style={{ display: 'none' }}
    />
  </label>
</div>
      </div>

      {preview && (
        <section style={{ marginTop: '25px', textAlign: 'center' }}>
          <h2>Anteprima</h2>

          <div
            style={{
              minHeight: '300px',
              display: 'grid',
              placeItems: 'center',
              overflow: 'hidden',
            }}
          >
            <img
              src={preview}
              alt="Bolla"
              style={{
                maxWidth: '90%',
                maxHeight: '500px',
                transform: `rotate(${rotation}deg)`,
                transition: 'transform 0.2s',
                clipPath: `inset(${cropTop}% 0 ${cropBottom}% 0)`,
              }}
            />
            <div className="crop-control">
  <label>
    Taglia sopra: {cropTop}%
  </label>

  <input
    type="range"
    min="0"
    max="60"
    value={cropTop}
    onChange={(e) => setCropTop(Number(e.target.value))}
  />
</div>
            <div className="crop-control">
  <label>
    Taglia sotto: {cropBottom}%
  </label>

  <input
    type="range"
    min="0"
    max="60"
    value={cropBottom}
    onChange={(e) => setCropBottom(Number(e.target.value))}
  />
</div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '10px',
              marginTop: '15px',
            }}
          >
            <button onClick={rotateLeft}>
              ↶ Ruota a sinistra
            </button>

            <button onClick={rotateRight}>
              ↷ Ruota a destra
            </button>

            <button
              onClick={readDocument}
              disabled={loading}
              style={{
                background: '#2f8f83',
                color: 'white',
              }}
            >
              🔎 Leggi bolla
            </button>
          </div>
        </section>
      )}

      {loading && (
        <section style={{ marginTop: '25px' }}>
          <p>
            Lettura in corso... <strong>{progress}%</strong>
          </p>

          <progress
            value={progress}
            max="100"
            style={{ width: '100%' }}
          />
        </section>
      )}

      {error && (
        <p style={{ color: '#b42318' }}>
          {error}
        </p>
      )}

      {text && (
        <section
          style={{
            marginTop: '25px',
            padding: '20px',
            background: 'white',
            borderRadius: '16px',
          }}
        >
          <h2>Testo riconosciuto</h2>
{items.length > 0 && (
  <div style={{ marginTop: '20px' }}>
    <h3>Righe trovate</h3>

    {items.map((item) => (
      <div
        key={item.id}
        style={{
          padding: '10px',
          marginBottom: '8px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          textAlign: 'left',
        }}
      >
      <div>
  <strong>Codice:</strong> {item.code || '—'}<br />
  {item.matchedMaterial ? '✅ Già in catalogo' : '🆕 Nuovo materiale'}<br />
  {item.matchedMaterial && (
  <div><strong>Prezzo catalogo:</strong> {item.matchedMaterial.lastCost || '—'} €</div>
)}
{item.matchedMaterial?.supplierPrices?.length > 0 && (
  <div style={{ marginTop: '6px' }}>
    <strong>Prezzi fornitori:</strong>
    {item.matchedMaterial.supplierPrices.map((entry, index) => (
      <div key={index}>
        {entry.supplier || 'Fornitore'} — {entry.price || '—'} €
      </div>
    ))}
  </div>
)}
{item.matchedMaterial &&
  item.matchedMaterial.lastCost &&
  item.price && (
    <div>
      <strong>Differenza:</strong>{' '}
      {(
        Number(String(item.price).replace(',', '.')) -
        Number(String(item.matchedMaterial.lastCost).replace(',', '.'))
      ).toFixed(2)} €
    </div>
)}
{item.matchedMaterial &&
  String(item.matchedMaterial.lastCost || '').replace(',', '.') !==
    String(item.price || '').replace(',', '.') && (
    <button onClick={() => updateMaterialPrice(item)}>
      Aggiorna prezzo catalogo
    </button>
)}
  {!item.matchedMaterial && (
  <button onClick={() => addNewMaterial(item)}>
    Aggiungi al catalogo
  </button>
)}
  <strong>Descrizione:</strong> {item.description || '—'}<br />
  <strong>UM:</strong> {item.um || '—'}<br />
  <strong>Quantità:</strong> {item.quantity || '—'}<br />
  <strong>Prezzo:</strong> {item.price || '—'}<br />
  <strong>Importo:</strong> {item.total || '—'}<br />
  <strong>IVA:</strong> {item.iva || '—'}
</div>
      </div>
    ))}
  </div>
)}
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            style={{
              width: '100%',
              minHeight: '300px',
              padding: '14px',
              fontSize: '15px',
            }}
          />
        </section>
      )}
    </main>
  )
}


export default ScanPage