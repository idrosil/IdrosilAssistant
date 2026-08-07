import { useState } from 'react'
import './App.css'
import MaterialsPage from './pages/MaterialsPage'
import ScanPage from './pages/ScanPage'
const stats = [
  { value: '305', label: 'Materiali', icon: '📦' },
  { value: '0', label: 'Clienti', icon: '👥' },
  { value: '0', label: 'Preventivi', icon: '📄' },
  { value: '0', label: 'Interventi', icon: '🔧' },
]

const menuItems = [
  {
    icon: '📷',
    title: 'Scansiona bolla',
    text: 'Importa foto o PDF e aggiorna automaticamente i prezzi',
    page: 'scan',
    featured: true,
  },
  {
    icon: '🔎',
    title: 'Catalogo materiali',
    text: 'Cerca articoli, codici, fornitori e storico prezzi',
    page: 'materials',
  },
  {
    icon: '👥',
    title: 'Clienti',
    text: 'Gestisci contatti, indirizzi e lavori eseguiti',
    page: 'clients',
  },
  {
    icon: '📄',
    title: 'Preventivi',
    text: 'Prepara e archivia preventivi professionali',
    page: 'quotes',
  },
  {
    icon: '🔧',
    title: 'Interventi',
    text: 'Registra lavori e materiali utilizzati',
    page: 'jobs',
  },
  {
    icon: '📅',
    title: 'Agenda',
    text: 'Organizza appuntamenti, scadenze e sopralluoghi',
    page: 'agenda',
  },
]

function App() {
  const [currentPage, setCurrentPage] = useState('home')

  const today = new Intl.DateTimeFormat('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  if (currentPage === 'materials') {
    return <MaterialsPage onBack={() => setCurrentPage('home')} />
  }
if (currentPage === 'scan') {
  return <ScanPage onBack={() => setCurrentPage('home')} />
}
  return (
    <main className="app">
      <header className="topbar">
        <div className="brand">
          <div className="logo-mark">
            <span>S</span>
          </div>

          <div>
            <h1>Idrosil Assistant</h1>
            <p>Gestionale aziendale</p>
          </div>
        </div>

        <button className="profile-button" type="button">
          MS
        </button>
      </header>

      <section className="hero">
        <div className="hero-content">
          <p className="date">{today}</p>
          <h2>Buon lavoro, Mirko 👋</h2>
          <p>
            Gestisci materiali, clienti, preventivi e interventi da un’unica
            applicazione.
          </p>

          <div className="hero-actions">
            <button className="primary-button" type="button">
              📷 Scansiona una bolla
            </button>

            <button className="secondary-button" type="button">
              ＋ Nuovo preventivo
            </button>
          </div>
        </div>

        <div className="hero-symbol">
          <div className="drop">S</div>
        </div>
      </section>

      <section className="search-section">
        <span className="search-icon">🔎</span>

        <input
          type="search"
          placeholder="Cerca materiale, cliente, preventivo o intervento..."
        />

        <button type="button">Cerca</button>
      </section>

      <section className="stats-grid">
        {stats.map((stat) => (
          <article className="stat-card" key={stat.label}>
            <span className="stat-icon">{stat.icon}</span>

            <div>
              <strong>{stat.value}</strong>
              <p>{stat.label}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="section-heading">
        <div>
          <p className="eyebrow">STRUMENTI</p>
          <h3>Cosa vuoi fare?</h3>
        </div>
      </section>

      <section className="menu-grid">
        {menuItems.map((item) => (
          <button
            className={`menu-card ${item.featured ? 'featured' : ''}`}
            key={item.title}
            type="button"
            onClick={() => setCurrentPage(item.page)}
          >
            <span className="menu-icon">{item.icon}</span>

            <span className="menu-content">
              <strong>{item.title}</strong>
              <small>{item.text}</small>
            </span>

            <span className="arrow">›</span>
          </button>
        ))}
      </section>

      <footer>
        <strong>Idrosil</strong>
        <span>Qualità · Affidabilità · Innovazione · Comfort</span>
      </footer>
    </main>
  )
}

export default App