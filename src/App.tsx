import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  Activity, Award, BarChart3, CalendarDays, ChevronRight, Disc3, DollarSign,
  Headphones, Home, Mic2, Music2, Plus, Radio, Settings2, Sparkles, Star,
  Users, Wallet, Zap, Play, Building2, Clapperboard
} from 'lucide-react'

type Artist = {
  name: string
  genre: string
  country: string
  startYear: number
  startWeek: number
  energy: number
  money: number
  fans: number
  popularity: number
  songs: string[]
  week: number
  year: number
}

const SAVE_KEY = 'music-career-simulator-save-v1'
const genres = ['Pop', 'Pop-rock', 'R&B', 'Rap', 'Hip-hop', 'Électro', 'Rock', 'Country', 'Indie', 'Soul', 'K-pop', 'Afro-pop']

function loadSave(): Artist | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    return raw ? JSON.parse(raw) as Artist : null
  } catch {
    return null
  }
}

function money(value: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)
}

function App() {
  const [artist, setArtist] = useState<Artist | null>(() => loadSave())
  const [tab, setTab] = useState('Vue d’ensemble')
  const [songTitle, setSongTitle] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (artist) localStorage.setItem(SAVE_KEY, JSON.stringify(artist))
  }, [artist])

  const dateLabel = useMemo(() => artist ? `Semaine ${artist.week} · ${artist.year}` : '', [artist])

  function createCareer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const name = String(data.get('name') || '').trim()
    if (!name) return
    const newArtist: Artist = {
      name,
      genre: String(data.get('genre') || 'Pop'),
      country: String(data.get('country') || 'France'),
      startYear: 2026,
      startWeek: 1,
      energy: 100,
      money: 250000,
      fans: 1200,
      popularity: 8,
      songs: [],
      week: 1,
      year: 2026,
    }
    localStorage.setItem(SAVE_KEY, JSON.stringify(newArtist))
    setArtist(newArtist)
    setNotice('Votre carrière vient de commencer. À vous de jouer !')
  }

  function advanceWeek() {
    if (!artist) return
    setArtist({
      ...artist,
      week: artist.week >= 52 ? 1 : artist.week + 1,
      year: artist.week >= 52 ? artist.year + 1 : artist.year,
      energy: Math.min(100, artist.energy + 15),
      popularity: Math.min(100, artist.popularity + (artist.fans > 10000 ? 1 : 0)),
      fans: artist.fans + Math.max(15, Math.round(artist.fans * 0.012)),
      money: artist.money + Math.round(artist.fans * 0.08),
    })
    setNotice('La semaine est terminée : votre carrière a progressé.')
  }

  function writeSong(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!artist || !songTitle.trim()) return
    setArtist({ ...artist, songs: [...artist.songs, songTitle.trim()], energy: Math.max(0, artist.energy - 10) })
    setSongTitle('')
    setNotice('Votre nouvelle chanson a été ajoutée au catalogue.')
  }

  function resetCareer() {
    if (!window.confirm('Supprimer définitivement cette sauvegarde locale et recommencer ?')) return
    localStorage.removeItem(SAVE_KEY)
    setArtist(null)
    setTab('Vue d’ensemble')
    setNotice('')
  }

  const nav = [
    { label: 'Vue d’ensemble', icon: Home },
    { label: 'Studio', icon: Mic2 },
    { label: 'Carrière', icon: Building2 },
    { label: 'Classements', icon: BarChart3 },
    { label: 'Récompenses', icon: Award },
  ]

  if (!artist) {
    return (
      <main className="welcome-screen">
        <div className="welcome-glow" />
        <div className="welcome-content">
          <div className="brand-mark"><Music2 size={22} /></div>
          <p className="eyebrow">VOTRE HISTOIRE COMMENCE ICI</p>
          <h1>La musique.<br /><span>Votre carrière.</span></h1>
          <p className="welcome-copy">Créez votre artiste, construisez votre univers et prenez les commandes de votre ascension dans l’industrie musicale.</p>
          <form className="creation-card" onSubmit={createCareer}>
            <div className="card-heading"><Sparkles size={18} /><span>Créer une nouvelle carrière</span></div>
            <label>Nom d’artiste<input name="name" placeholder="Ex. : Nova" maxLength={32} required /></label>
            <div className="form-row">
              <label>Genre musical<select name="genre">{genres.map(genre => <option key={genre}>{genre}</option>)}</select></label>
              <label>Pays<select name="country"><option>France</option><option>États-Unis</option><option>Royaume-Uni</option><option>Canada</option><option>Belgique</option><option>Corée du Sud</option><option>Autre</option></select></label>
            </div>
            <button className="primary-button" type="submit">Lancer ma carrière <ChevronRight size={18} /></button>
            <p className="form-footnote">Une sauvegarde sera créée automatiquement sur cet appareil.</p>
          </form>
          <div className="welcome-footer"><span>UNIVERS MUSICAL SIMULÉ</span><span>VERSION 0.1.0</span></div>
        </div>
      </main>
    )
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand"><div className="brand-mark small"><Music2 size={18} /></div><span>Music Career<br /><b>Simulator</b></span></div>
        <div className="profile-mini"><div className="avatar">{artist.name.slice(0, 1).toUpperCase()}</div><div><strong>{artist.name}</strong><span>{artist.genre} · {artist.country}</span></div></div>
        <p className="nav-caption">ESPACE ARTISTE</p>
        <nav>{nav.map(item => <button key={item.label} className={tab === item.label ? 'nav-item active' : 'nav-item'} onClick={() => setTab(item.label)}><item.icon size={17} /><span>{item.label}</span>{tab === item.label && <span className="nav-dot" />}</button>)}</nav>
        <div className="sidebar-bottom"><div className="season-chip"><CalendarDays size={15} /><span>{dateLabel}</span></div><button className="settings-button" onClick={resetCareer}><Settings2 size={16} /> Réinitialiser la partie</button><span className="version-label">MCS · ALPHA 0.1</span></div>
      </aside>

      <main className="main-area">
        <header className="topbar"><div><span className="breadcrumb">ESPACE ARTISTE</span><span className="breadcrumb-sep">/</span><strong>{tab}</strong></div><div className="topbar-right"><span className="live-indicator"><i /> Simulation active</span><button className="next-week" onClick={advanceWeek}><Play size={14} fill="currentColor" /> Semaine suivante</button></div></header>
        <div className="page-content">
          {notice && <button className="notice" onClick={() => setNotice('')}><Sparkles size={15} />{notice}<span>×</span></button>}
          {tab === 'Vue d’ensemble' && <>
            <section className="page-intro"><div><p className="eyebrow">TABLEAU DE BORD · {dateLabel.toUpperCase()}</p><h1>Bonjour, {artist.name} <span>✦</span></h1><p>Chaque décision compte. Votre prochaine étape vous appartient.</p></div><div className="career-status"><span className="status-icon"><Star size={17} /></span><div><small>STATUT ACTUEL</small><strong>{artist.popularity >= 75 ? 'Star incontournable' : artist.popularity >= 35 ? 'Artiste confirmé' : 'Nouvel artiste'}</strong></div></div></section>
            <section className="stats-grid">
              <Stat icon={Wallet} label="Trésorerie" value={money(artist.money)} note="Fonds disponibles" />
              <Stat icon={Users} label="Communauté" value={artist.fans.toLocaleString('fr-FR')} note="Fans dans le monde" />
              <Stat icon={Star} label="Popularité" value={`${artist.popularity}/100`} note="Notoriété actuelle" />
              <Stat icon={Zap} label="Énergie" value={`${artist.energy}/100`} note="Récupération chaque semaine" />
            </section>
            <section className="dashboard-grid">
              <div className="panel spotlight-panel"><div className="panel-top"><div><p className="eyebrow">VOTRE PROCHAINE ÉTAPE</p><h2>Tout commence au studio.</h2></div><div className="panel-icon"><Headphones size={20} /></div></div><p>Écrivez vos premiers titres, développez votre identité musicale et préparez votre première sortie.</p><button className="text-button" onClick={() => setTab('Studio')}>Découvrir le studio <ChevronRight size={16} /></button><div className="spotlight-decoration"><Disc3 size={126} strokeWidth={0.7} /></div></div>
              <div className="panel activity-panel"><div className="panel-top"><div><p className="eyebrow">VOTRE PARCOURS</p><h2>Début de carrière</h2></div><Activity size={19} className="muted-icon" /></div><div className="milestone"><span className="milestone-check"><Star size={13} /></span><div><strong>Artiste créé</strong><small>Votre aventure commence</small></div><span className="milestone-tag">TERMINÉ</span></div><div className="milestone"><span className="milestone-number">02</span><div><strong>Écrire votre premier titre</strong><small>Rendez-vous dans le studio</small></div><ChevronRight size={16} className="muted-icon" /></div><div className="milestone"><span className="milestone-number">03</span><div><strong>Sortir votre premier single</strong><small>À venir</small></div><ChevronRight size={16} className="muted-icon" /></div></div>
            </section>
            <section className="panel catalogue-panel"><div className="panel-top"><div><p className="eyebrow">DISCOGRAPHIE</p><h2>Votre catalogue musical</h2></div><span className="count-pill">{artist.songs.length} titre{artist.songs.length > 1 ? 's' : ''}</span></div>{artist.songs.length ? <div className="song-list">{artist.songs.map((song, i) => <div className="song-row" key={`${song}-${i}`}><span className="song-index">{String(i + 1).padStart(2, '0')}</span><div className="song-art"><Music2 size={17} /></div><strong>{song}</strong><span className="song-state">ENREGISTREMENT À FAIRE</span></div>)}</div> : <div className="empty-state"><div className="empty-disc"><Disc3 size={27} /></div><strong>Votre discographie est encore vierge</strong><span>Votre premier morceau n’attend que vous.</span><button className="subtle-button" onClick={() => setTab('Studio')}><Plus size={15} /> Écrire une chanson</button></div>}</section>
          </>}
          {tab === 'Studio' && <><PageHeading eyebrow="CRÉATION & PRODUCTION" title="Le studio" subtitle="C’est ici que votre identité musicale prend forme." /><div className="studio-grid"><div className="panel"><div className="panel-top"><div><p className="eyebrow">ÉCRITURE</p><h2>Nouvelle chanson</h2></div><div className="panel-icon"><Mic2 size={20} /></div></div><p className="panel-description">Donnez un titre à votre prochaine création. L’écriture consomme de l’énergie.</p><form onSubmit={writeSong} className="song-form"><label>Titre de la chanson<input value={songTitle} onChange={e => setSongTitle(e.target.value)} placeholder="Votre prochain hit…" maxLength={70} required /></label><div className="cost-line"><span><Zap size={14} /> Coût en énergie</span><strong>−10 points</strong></div><button className="primary-button" type="submit" disabled={artist.energy < 10}>Écrire le titre <ChevronRight size={17} /></button>{artist.energy < 10 && <small className="warning-text">Vous êtes trop fatigué. Passez à la semaine suivante pour récupérer.</small>}</form></div><div className="panel energy-panel"><p className="eyebrow">RESSOURCES</p><h2>Votre énergie</h2><div className="energy-number">{artist.energy}<span>/100</span></div><div className="progress-track"><div style={{width:`${artist.energy}%`}} /></div><p>Votre énergie se régénère automatiquement à chaque nouvelle semaine.</p><div className="energy-tip"><Zap size={16} /><span>Gérez votre énergie : les actions de carrière auront des coûts différents.</span></div></div></div><div className="panel catalogue-panel"><div className="panel-top"><div><p className="eyebrow">BIBLIOTHÈQUE</p><h2>Chansons écrites</h2></div><span className="count-pill">{artist.songs.length} titre{artist.songs.length > 1 ? 's' : ''}</span></div>{artist.songs.length ? artist.songs.map((song, i) => <div className="song-row" key={`${song}-${i}`}><span className="song-index">{String(i+1).padStart(2,'0')}</span><div className="song-art"><Music2 size={17}/></div><strong>{song}</strong><span className="song-state">À PRODUIRE</span></div>) : <div className="empty-state compact"><Disc3 size={25}/><span>Aucune chanson pour le moment.</span></div>}</div></>}
          {tab === 'Carrière' && <><PageHeading eyebrow="DÉVELOPPEMENT PROFESSIONNEL" title="Votre carrière" subtitle="Les outils pour faire grandir votre projet musical." /><div className="feature-grid"><Feature icon={Radio} title="Promotion & médias" text="Préparez vos campagnes, gérez votre image et développez votre visibilité." /><Feature icon={Users} title="Communauté" text="Fédérez votre public et entretenez la relation avec vos fans." /><Feature icon={DollarSign} title="Finances & contrats" text="Suivez vos revenus, négociez des contrats et gérez votre budget." /><Feature icon={Clapperboard} title="Clips & visuels" text="Construisez un univers visuel autour de vos sorties musicales." /><Feature icon={Building2} title="Maisons de disques" text="Explorez les possibilités de partenariats avec l’industrie musicale." /><Feature icon={Headphones} title="Concerts & tournées" text="Montez sur scène et partez à la rencontre de votre public." /></div><p className="coming-note"><Sparkles size={15}/> Ces modules seront développés progressivement.</p></>}
          {tab === 'Classements' && <><PageHeading eyebrow="PERFORMANCES" title="Classements" subtitle="Suivez les performances de vos titres et de vos albums." /><div className="empty-feature"><BarChart3 size={32}/><h2>Les classements arrivent bientôt</h2><p>Le moteur simulera les ventes, les écoutes, les entrées et les évolutions des classements chaque semaine.</p></div></>}
          {tab === 'Récompenses' && <><PageHeading eyebrow="DISTINCTIONS" title="Récompenses" subtitle="Les grandes cérémonies et les distinctions de l’industrie." /><div className="empty-feature"><Award size={34}/><h2>Votre palmarès reste à écrire</h2><p>Les nominations et les cérémonies seront liées aux performances de votre carrière.</p></div></>}
        </div>
      </main>
    </div>
  )
}

function Stat({icon: Icon, label, value, note}: {icon: typeof Wallet, label: string, value: string, note: string}) {
  return <div className="stat-card"><div className="stat-top"><span>{label}</span><div className="stat-icon"><Icon size={17}/></div></div><strong>{value}</strong><small>{note}</small></div>
}
function PageHeading({eyebrow, title, subtitle}: {eyebrow:string, title:string, subtitle:string}) {
  return <section className="page-intro simple"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{subtitle}</p></div></section>
}
function Feature({icon: Icon, title, text}: {icon: typeof Radio, title:string, text:string}) {
  return <div className="panel feature-card"><div className="panel-icon"><Icon size={19}/></div><h3>{title}</h3><p>{text}</p><span className="feature-soon">BIENTÔT DISPONIBLE</span></div>
}

export default App
