import { useMemo, useState } from 'react'
import * as XLSX from 'xlsx'

function MaterialsPage({ onBack }) {
 const [materials, setMaterials] = useState(() => {
  const saved = localStorage.getItem('idrosilMaterials')
  return saved ? JSON.parse(saved) : []
})

  const [query, setQuery] = useState('')
  const [error, setError] = useState('')

  const handleFile = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setError('')

      const buffer = await file.arrayBuffer()
      const workbook = XLSX.read(buffer)

      const sheetName = workbook.SheetNames.includes('CATALOGO_UNIFICATO')
        ? 'CATALOGO_UNIFICATO'
        : workbook.SheetNames[0]

      const worksheet = workbook.Sheets[sheetName]
      const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' })

      const parsed = rows
        .filter((row) => row['ID catalogo'] || row['Nome materiale unificato'])
        .map((row, index) => ({
          id: row['ID catalogo'] || `MAT-${index + 1}`,
          name: row['Nome materiale unificato'] || '',
          aliases: row['Sinonimi/varianti'] || '',
          category: row['Categoria'] || '',
          suppliers: row['Fornitori presenti'] || '',
          lastSupplier: row['Ultimo fornitore'] || '',
          lastCode: row['Ultimo codice'] || '',
          lastCost: row['Ultimo costo'] || '',
          averageCost: row['Costo medio'] || '',
          minimumCost: row['Costo minimo'] || '',
          maximumCost: row['Costo massimo'] || '',
          suggestedPrice: row['Prezzo vendita suggerito'] || '',
          purchaseCount: row['N. acquisti'] || '',
          supplierCodes: row['Codici fornitore'] || '',
          status: row['Stato'] || '',
        }))

      setMaterials(parsed)
      localStorage.setItem('idrosilMaterials', JSON.stringify(parsed))
    } catch (err) {
      console.error(err)
      setError('Non sono riuscito a leggere il file Excel.')
    }
  }

  const filteredMaterials = useMemo(() => {
    const text = query.trim().toLowerCase()

    if (!text) return materials

    return materials.filter((material) => {
      const searchable = [
        material.name,
        material.aliases,
        material.category,
        material.suppliers,
        material.lastSupplier,
        material.lastCode,
        material.supplierCodes,
      ]
        .join(' ')
        .toLowerCase()

      return text
        .split(/\s+/)
        .filter(Boolean)
        .every((word) => searchable.includes(word))
    })
  }, [materials, query])

  const formatEuro = (value) => {
    if (value === '' || value === null || value === undefined) return '—'

    const number = Number(value)

    if (Number.isNaN(number)) return String(value)

    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 3,
    }).format(number)
  }

  return (
    <main style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <button onClick={onBack}>← Torna alla Home</button>

      <h1>Catalogo Materiali</h1>

      <p>
        Importa il MASTER Excel e cerca per descrizione, codice, categoria o
        fornitore.
      </p>

      <div style={{ margin: '24px 0' }}>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFile}
        />
      </div>

      {error && (
        <p style={{ color: 'red' }}>
          {error}
        </p>
      )}

      {materials.length > 0 && (
        <>
          <div style={{ marginBottom: '20px' }}>
            <input
              type="search"
              placeholder="Cerca materiale, codice o fornitore..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '16px',
                borderRadius: '10px',
                border: '1px solid #ccc',
              }}
            />
          </div>

          <p>
            <strong>{filteredMaterials.length}</strong> materiali trovati su{' '}
            <strong>{materials.length}</strong>
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '14px',
            }}
          >
            {filteredMaterials.map((material) => (
              <article
                key={material.id}
                style={{
                  background: 'white',
                  border: '1px solid #dce9e7',
                  borderRadius: '16px',
                  padding: '16px',
                  boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
                }}
              >
                <h3 style={{ marginTop: 0 }}>
                  {material.name}
                </h3>

                <p>
                  <strong>Categoria:</strong> {material.category || '—'}
                </p>

                <p>
                  <strong>Fornitore:</strong>{' '}
                  {material.lastSupplier || material.suppliers || '—'}
                </p>

                <p>
                  <strong>Codice:</strong> {material.lastCode || '—'}
                </p>

                <p>
                  <strong>Ultimo costo:</strong>{' '}
                  {formatEuro(material.lastCost)}
                </p>

                <p>
                  <strong>Costo medio:</strong>{' '}
                  {formatEuro(material.averageCost)}
                </p>

                <p>
                  <strong>Prezzo vendita suggerito:</strong>{' '}
                  {formatEuro(material.suggestedPrice)}
                </p>
              </article>
            ))}
          </div>
        </>
      )}
    </main>
  )
}

export default MaterialsPage