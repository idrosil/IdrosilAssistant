import { useState } from 'react'

function CashPage({ onBack }) {
  const [movements, setMovements] = useState(() => {
    const saved = localStorage.getItem('idrosilMovements')
    return saved ? JSON.parse(saved) : []
  })

  const totalEntrate = movements
    .filter((m) => m.type === 'entrata')
    .reduce((sum, m) => sum + Number(m.amount || 0), 0)

  const totalUscite = movements
    .filter((m) => m.type === 'uscita')
    .reduce((sum, m) => sum + Number(m.amount || 0), 0)

  const daIncassare = movements
    .filter((m) => m.type === 'entrata' && !m.paid)
    .reduce((sum, m) => sum + Number(m.amount || 0), 0)

  const saldo = totalEntrate - totalUscite
const [type, setType] = useState('entrata')
const [description, setDescription] = useState('')
const [amount, setAmount] = useState('')
const [paid, setPaid] = useState(true)
const [invoiced, setInvoiced] = useState(false)
const addMovement = () => {
  if (!description.trim() || !amount) return

  const newMovement = {
    id: Date.now(),
    type,
    description: description.trim(),
    amount: Number(String(amount).replace(',', '.')),
    paid,
    invoiced,
    date: new Date().toISOString(),
  }

  const updatedMovements = [newMovement, ...movements]

  setMovements(updatedMovements)
  localStorage.setItem('idrosilMovements', JSON.stringify(updatedMovements))

  setDescription('')
  setAmount('')
}
const deleteMovement = (id) => {
  const updatedMovements = movements.filter(
    (movement) => movement.id !== id
  )

  setMovements(updatedMovements)
  localStorage.setItem(
    'idrosilMovements',
    JSON.stringify(updatedMovements)
  )
}
  return (
    <div style={{ padding: '20px' }}>
      <button onClick={onBack}>← Indietro</button>

      <h1>💰 Entrate e Uscite</h1>
      <p>Gestione economica Idrosil</p>
<div style={{ marginBottom: '25px' }}>
  <h2>➕ Registra movimento</h2>

  <select
    value={type}
    onChange={(e) => setType(e.target.value)}
  >
    <option value="entrata">💵 Entrata</option>
    <option value="uscita">🧾 Uscita</option>
  </select>

  <input
    type="text"
    placeholder="Cliente, fornitore o descrizione"
    value={description}
    onChange={(e) => setDescription(e.target.value)}
  />

  <input
    type="number"
    step="0.01"
    placeholder="Importo €"
    value={amount}
    onChange={(e) => setAmount(e.target.value)}
  />

  <label>
    <input
      type="checkbox"
      checked={paid}
      onChange={(e) => setPaid(e.target.checked)}
    />
    {type === 'entrata' ? ' Pagato / incassato' : ' Pagato'}
  </label>

  <label>
    <input
      type="checkbox"
      checked={invoiced}
      onChange={(e) => setInvoiced(e.target.checked)}
    />
    Fatturato
  </label>

  <button onClick={addMovement}>
    Salva movimento
  </button>
</div>
      <div>
        <h3>💵 Entrate</h3>
        <strong>{totalEntrate.toFixed(2)} €</strong>
      </div>

      <div>
        <h3>🧾 Uscite</h3>
        <strong>{totalUscite.toFixed(2)} €</strong>
      </div>

      <div>
        <h3>⏳ Da incassare</h3>
        <strong>{daIncassare.toFixed(2)} €</strong>
      </div>

      <div>
        <h3>📊 Saldo</h3>
        <strong>{saldo.toFixed(2)} €</strong>
      </div>
      <div style={{ marginTop: '30px' }}>
  <h2>📋 Movimenti recenti</h2>

  {movements.length === 0 ? (
    <p>Nessun movimento registrato.</p>
  ) : (
    movements.map((movement) => (
      <div
        key={movement.id}
        style={{
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '10px',
          marginBottom: '10px',
          textAlign: 'left',
        }}
      >
        <strong>
          {movement.type === 'entrata' ? '💵 Entrata' : '🧾 Uscita'}
        </strong>
        <br />

        {movement.description}
        <br />

        <strong>{Number(movement.amount).toFixed(2)} €</strong>
        <br />

        {movement.paid ? '✅ Pagato' : '⏳ Da pagare/incassare'}
        {' · '}
        {movement.invoiced ? '🧾 Fatturato' : 'Non fatturato'}
        <br />

<button onClick={() => deleteMovement(movement.id)}>
  🗑️ Elimina
</button>
      </div>
    ))
  )}
</div>
    </div>
  )
}

export default CashPage