import { useEffect, useMemo, useState, type FormEvent } from 'react'
import Ecosystem from './Ecosystem'
import CareerModules from './CareerModules'
import { buildMarketCharts, type MarketCharts } from './careerData'
import {
  Activity, BarChart3, CalendarDays, ChevronRight, Disc3,
  Headphones, Home, Mic2, Music2, Settings2, Sparkles, Star,
  Users, Wallet, Play, Building2,
  Globe2, TrendingUp, Ticket, Shirt, Newspaper
} from 'lucide-react'

type Track = { id: string; title: string; released: boolean; spotify: number; apple: number; youtube: number; radio: number; total: number; rank: number | null; peak: number | null }
type Release = { id: string; title: string; type: 'Single' | 'Album'; format?: string; trackIds: string[]; week: number; year: number; firstWeekStreams: number; currentRank: number | null; peak: number | null; masterOwnership?:'label'|'artist'|'shared'|'license'; masterArtistShare?:number; labelContractId?:string; territories?:string[] }
type FeedPost = { id: string; week: number; year: number; source: string; text: string }
export type SocialPublication = { id:string; platform:'X'|'Instagram'|'TikTok'; kind:string; text:string; week:number; year:number; views:number; likes:number; comments:number; shares:number; boostWeeks:number; boost:number; mediaData?:string; mediaType?:string }
type ChartEntry = { name: string; artist: string; streams: number; own: boolean; rank: number }
type TourShow = { id: string; city: string; venue: string; capacity: number; sold: number; revenue: number; week: number; year: number; country?: string; ticketPrice?: number; vipPrice?: number; tourTitle?: string; setlist?: string[]; associatedAlbum?: string }
export type LabelContract = {
  id:string; label:string; years:number; projects:number; remainingProjects?:number; remainingWeeks?:number; types:string[];
  royalty:number; artistRoyalty?:number; advance:number; marketing:number; recordingBudget?:number; recoupableBalance?:number;
  masterOwnership?:'label'|'artist'|'shared'|'license'; artistMasterShare?:number; distributionFee?:number;
  territories?:string[]; exclusive?:boolean; creativeControl?:number; threeSixtyShare?:number; merchShare?:number; liveShare?:number;
  signedWeek?:number; signedYear?:number; status?:'active'|'expired'|'terminated';
}
export type Artist = {
  name: string; genre: string; country: string; image: string
  energy: number; money: number; fans: number; popularity: number
  week: number; year: number; tracks: Track[]; releases: Release[]
  spotify: number; apple: number; youtube: number; radio: number
  posts: FeedPost[]; wiki: string[]; chart: ChartEntry[]; albumChart: ChartEntry[]; chartHistory: {week:number;year:number;rank:number;title:string}[]
  label: string; labelShare: number; tour: TourShow[]; merch: number; merchRevenue: number
  socialAccounts?: {instagram:number;x:number;tiktok:number}; socialPosts?: SocialPublication[]; spotifyFollowers?:number; lastWeekStreams?:number; campaigns?:{id:string;name:string;remainingWeeks:number;multiplier:number;releaseId?:string}[]
  age?:number; bio?:string; marketCharts?:MarketCharts; draftReleases?:{id:string;title:string;format:string;trackIds:string[];week:number;year:number}[]; contracts?:LabelContract[]
  merchItems?:{id:string;name:string;kind:string;price:number;cost:number;releaseId:string;active:boolean;sold:number}[]; manager?:string; ownLabelName?:string; tourName?:string
}
const SAVE_KEY = 'music-career-simulator-save-v2'
const OLD_KEY = 'music-career-simulator-save-v1'
const genres = ['Pop','Pop-rock','R&B','Rap','Hip-hop','Électro','Rock','Country','Indie','Soul','K-pop','Afro-pop','Jazz','Folk','Dance']
const competitors = ['Luna Vale','The Velvet Hours','Milo June','Nova Grey','Éloïse','Jade Rivers','Sienna Rose','Atlas Bloom','Maya Sol','Noah West','Iris Monroe','The Satellites','Ariane Blue','Kai Rivers','Sunday Club','Léonie','Romy Skye','Eden Park','Lola June','Mister Moon']
const platforms = [
  {name:'Spotify',key:'spotify' as const,rate:.0035,cls:'spotify',label:'SPOTIFY'},
  {name:'Apple Music',key:'apple' as const,rate:.007,cls:'apple',label:'APPLE MUSIC'},
  {name:'YouTube',key:'youtube' as const,rate:.0012,cls:'youtube',label:'YOUTUBE'},
  {name:'Radio',key:'radio' as const,rate:.0008,cls:'radio',label:'RADIO'}
]
const fmt = (n:number) => new Intl.NumberFormat('fr-FR').format(Math.round(n))
const money = (n:number) => new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n)
const id = () => Math.random().toString(36).slice(2,10)
const clamp = (n:number,min:number,max:number) => Math.max(min,Math.min(max,n))
function saveLoad(): Artist | null {
  try {
    const raw=localStorage.getItem(SAVE_KEY)
    if(raw) return JSON.parse(raw) as Artist
    const old=localStorage.getItem(OLD_KEY)
    if(old) {
      const a=JSON.parse(old)
      return {...a,image:'',tracks:(a.songs||[]).map((title:string)=>({id:id(),title,released:false,spotify:0,apple:0,youtube:0,radio:0,total:0,rank:null,peak:null})),releases:[],spotify:0,apple:0,youtube:0,radio:0,posts:[],wiki:['La carrière de '+a.name+' débute dans l’industrie musicale.'],chart:[],albumChart:[],chartHistory:[],label:'Indépendant',labelShare:0,tour:[],merch:0,merchRevenue:0}
    }
    return null
  } catch { return null }
}
function App() {
  const [artist,setArtist]=useState<Artist|null>(()=>saveLoad())
  const [tab,setTab]=useState('Vue d’ensemble')
  const [notice,setNotice]=useState('')

  useEffect(()=>{if(artist)localStorage.setItem(SAVE_KEY,JSON.stringify(artist))},[artist])
  const dateLabel=useMemo(()=>artist?`Semaine ${artist.week} · ${artist.year}`:'',[artist])

  function createCareer(e:FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const d=new FormData(e.currentTarget)
    const name=String(d.get('name')||'').trim()
    if(!name)return
    const startMoney=Number(d.get('money')||250000), fans=Number(d.get('fans')||1200), popularity=Number(d.get('popularity')||8)
    const newArtist:Artist={
      name,genre:String(d.get('genre')||'Pop'),country:String(d.get('country')||'France'),image:String(d.get('image')||''),age:Number(d.get('age'))||undefined,
      energy:100,money:startMoney,fans,popularity,week:1,year:2026,tracks:[],releases:[],
      spotify:0,apple:0,youtube:0,radio:0,posts:[{id:id(),week:1,year:2026,source:'Système',text:`Bienvenue dans l’industrie musicale, ${name} ! Une nouvelle carrière commence aujourd’hui.`}],
      wiki:[`${name} est un artiste ou une artiste de musique ${String(d.get('genre')||'Pop')}, originaire de ${String(d.get('country')||'France')}.`,'Sa carrière débute en 2026.'],
      chart:[],albumChart:[],chartHistory:[],label:'Indépendant',labelShare:0,tour:[],merch:0,merchRevenue:0
    }
    localStorage.removeItem(OLD_KEY);localStorage.setItem(SAVE_KEY,JSON.stringify(newArtist));setArtist(newArtist);setNotice('Votre carrière est lancée. À vous de construire la suite !')
  }
  function nextWeek() {
    if(!artist)return
    const week=artist.week>=52?1:artist.week+1,year=artist.week>=52?artist.year+1:artist.year
    const active=artist.tracks.filter(t=>t.released)
    const popularityFactor=.45+artist.popularity/45
    const weekly=active.map((t,i)=>{
      const age=artist.releases.find(r=>r.trackIds.includes(t.id))
      const weeksOld=age?Math.max(0,(artist.year-age.year)*52+artist.week-age.week):0
      const decay=Math.max(.16,1-weeksOld*.045)
      const seed=Math.abs(Math.sin((week+year+i*13)*91.7))
      const socialBoost=Math.min(2.5,(artist.socialPosts??[]).filter(p=>p.boostWeeks>0).reduce((v,p)=>v*p.boost,1))
      const campaignBoost=Math.min(2,(artist.campaigns??[]).filter(c=>c.remainingWeeks>0&&(!c.releaseId||artist.releases.some(r=>r.id===c.releaseId&&r.trackIds.includes(t.id)))).reduce((v,c)=>v*c.multiplier,1))
      const showsThisWeek=artist.tour.filter(s=>s.week===week&&s.year===year)
      const tourBoost=showsThisWeek.length?1.18:1
      const setlistBoost=showsThisWeek.some(s=>s.setlist?.includes(t.id))?1.22:1
      const albumTourBoost=showsThisWeek.some(s=>s.associatedAlbum&&artist.releases.some(r=>r.id===s.associatedAlbum&&r.trackIds.includes(t.id)))?1.12:1
      const base=Math.round((artist.fans*.55+artist.popularity*210)*popularityFactor*decay*(.72+seed*.58)*socialBoost*campaignBoost*tourBoost*setlistBoost*albumTourBoost)
      const spotify=Math.round(base*.64),apple=Math.round(base*.23),youtube=Math.round(base*.13)
      const radio=Math.round(base*(artist.popularity/100)*.08)
      return {...t,spotify:t.spotify+spotify,apple:t.apple+apple,youtube:t.youtube+youtube,radio:t.radio+radio,total:t.total+spotify+apple+youtube,rank:null as number|null}
    })
    const weeklyStreams=weekly.reduce((s,t)=>s+(t.spotify+t.apple+t.youtube-(artist.tracks.find(x=>x.id===t.id)?.spotify||0)-(artist.tracks.find(x=>x.id===t.id)?.apple||0)-(artist.tracks.find(x=>x.id===t.id)?.youtube||0)),0)
    const competitorEntries=Array.from({length:99},(_,i)=>{
      const n=i+1,seed=Math.abs(Math.sin((year*52+week+n*19)*7.31))
      return {name:['Neon Hearts','Golden Hour','Afterglow','Satellite','Wildflower','Blue','Midnight City','Heartbeat'][n%8]+' '+(n+week),artist:competitors[(n+week)%competitors.length],streams:Math.round((19000000/(n**.78))*(.75+seed*.55)),own:false,rank:0}
    })
    const ownEntries=weekly.map(t=>({name:t.title,artist:artist.name,streams:Math.max(1,Math.round(t.spotify+t.apple+t.youtube-(artist.tracks.find(x=>x.id===t.id)?.spotify||0)-(artist.tracks.find(x=>x.id===t.id)?.apple||0)-(artist.tracks.find(x=>x.id===t.id)?.youtube||0))),own:true,rank:0}))
    const chart=[...competitorEntries,...ownEntries].sort((a,b)=>b.streams-a.streams).slice(0,100).map((x,i)=>({...x,rank:i+1}))
    const albumCompetitors=Array.from({length:99},(_,i)=>{const n=i+1,seed=Math.abs(Math.sin((year*19+week+n*31)*3.17));return {name:['Golden Hour','Blue Skies','The Other Side','Afterglow','Electric Dreams'][n%5]+' — '+(n+week),artist:competitors[(n+week*2)%competitors.length],streams:Math.round((28000000/(n**.82))*(.7+seed*.6)),own:false,rank:0}})
    const ownAlbums=artist.releases.filter(r=>r.type==='Album').map(r=>({name:r.title,artist:artist.name,streams:r.trackIds.reduce((sum,trackId)=>{const now=weekly.find(t=>t.id===trackId),old=artist.tracks.find(t=>t.id===trackId);return sum+(now?now.total-(old?.total||0):0)},0),own:true,rank:0}))
    const albumChart=[...albumCompetitors,...ownAlbums].sort((a,b)=>b.streams-a.streams).slice(0,100).map((x,i)=>({...x,rank:i+1}))
    const chartPosts:FeedPost[]=[]
    const chartHistory=[...artist.chartHistory]
    const updatedTracks=weekly.map(t=>{
      const rank=chart.find(c=>c.own&&c.name===t.title)?.rank??null
      if(rank!==null){
        const previous=artist.tracks.find(x=>x.id===t.id)?.rank
        if(previous!==rank) chartPosts.push({id:id(),week,year,source:'Charts Update',text:`Cette semaine, « ${t.title} » de ${artist.name} se classe ${rank}e du classement mondial (${fmt(t.total-(artist.tracks.find(x=>x.id===t.id)?.total||0))} écoutes cette semaine).`})
        chartHistory.push({week,year,rank,title:t.title})
      }
      return {...t,rank,peak:rank===null?t.peak:Math.min(t.peak??rank,rank)}
    })
    const releases=artist.releases.map(r=>{
      const releaseTracks=updatedTracks.filter(t=>r.trackIds.includes(t.id))
      const streams=releaseTracks.reduce((s,t)=>s+t.total,0)
      const firstWeekStreams=r.firstWeekStreams||streams
      const rank=(r.type==='Album'?albumChart.find(c=>c.own&&c.name===r.title)?.rank:chart.find(c=>c.own&&releaseTracks.some(t=>t.title===c.name))?.rank)??null
      return {...r,firstWeekStreams,currentRank:rank,peak:rank===null?r.peak:Math.min(r.peak??rank,rank)}
    })
    const marketCharts=buildMarketCharts(artist,updatedTracks,week,year,artist.marketCharts)
    const contracts=(artist.contracts??[]).map(c=>({...c,remainingWeeks:Math.max(0,(c.remainingWeeks??c.years*52)-1),status:(c.remainingWeeks??c.years*52)<=1?'expired':c.status??'active'}))
    const activeContract=contracts.find(c=>(c.remainingWeeks??0)>0&&(c.status??'active')==='active')
    const platformDelta={spotify:updatedTracks.reduce((s,t)=>s+(t.spotify-(artist.tracks.find(x=>x.id===t.id)?.spotify||0)),0),apple:updatedTracks.reduce((s,t)=>s+(t.apple-(artist.tracks.find(x=>x.id===t.id)?.apple||0)),0),youtube:updatedTracks.reduce((s,t)=>s+(t.youtube-(artist.tracks.find(x=>x.id===t.id)?.youtube||0)),0),radio:updatedTracks.reduce((s,t)=>s+(t.radio-(artist.tracks.find(x=>x.id===t.id)?.radio||0)),0)}
    const streamingRevenue=platformDelta.spotify*.0035+platformDelta.apple*.007+platformDelta.youtube*.0012+platformDelta.radio*.0008
    const merchItems=(artist.merchItems??[]).map(item=>{const sold=item.active?Math.min(Math.max(0,Math.round(artist.fans*.00016*(.7+artist.popularity/100))),Math.max(0,100000-item.sold)):0;return {...item,sold:item.sold+sold}})
    const merchUnits=merchItems.reduce((sum,item)=>sum+(item.sold-((artist.merchItems??[]).find(old=>old.id===item.id)?.sold??0)),0)
    const merchRevenue=merchItems.reduce((sum,item)=>sum+(item.sold-((artist.merchItems??[]).find(old=>old.id===item.id)?.sold??0))*item.price,0)
    const merchCosts=merchItems.reduce((sum,item)=>sum+(item.sold-((artist.merchItems??[]).find(old=>old.id===item.id)?.sold??0))*item.cost,0)
    const tourRevenue=artist.tour.filter(s=>s.week===week&&s.year===year).reduce((s,x)=>s+x.revenue,0)
    const gross=streamingRevenue+merchRevenue+tourRevenue-merchCosts
    const artistRoyaltyRate=activeContract?(activeContract.artistRoyalty??(100-activeContract.royalty)):100
    const distributionFee=activeContract?(activeContract.distributionFee??0):0
    const merchCut=activeContract?(activeContract.merchShare??activeContract.threeSixtyShare??0):0
    const liveCut=activeContract?(activeContract.liveShare??activeContract.threeSixtyShare??0):0
    const artistGrossShare=activeContract
      ? streamingRevenue*(1-distributionFee/100)*artistRoyaltyRate/100+(merchRevenue-merchCosts)*(1-merchCut/100)+tourRevenue*(1-liveCut/100)
      : gross
    const recouped=activeContract?Math.min(activeContract.recoupableBalance??0,artistGrossShare):0
    const net=artistGrossShare-recouped
    const settledContracts=contracts.map(c=>c.id===activeContract?.id?{...c,recoupableBalance:Math.max(0,(c.recoupableBalance??0)-recouped)}:c)
    const newFans=Math.round(Math.max(8,artist.fans*(.004+artist.popularity/10000)+(weeklyStreams/120000)))
    const pop=clamp(artist.popularity+(weeklyStreams>1000000?1.2:weeklyStreams>100000?.45:-.12)+(chart.some(c=>c.own&&c.rank<=10)?1.5:0),0,100)
    const randomCompetitor=competitors[(week+year)%competitors.length]
    const weeklyPosts:FeedPost[]=[
      {id:id(),week,year,source:'Music News',text:`Bilan de la semaine : ${artist.name} cumule ${fmt(weeklyStreams)} nouvelles écoutes sur les plateformes.`},
      ...chartPosts.slice(0,3)
    ]
    if(chart.some(c=>c.own&&c.rank===1))weeklyPosts.unshift({id:id(),week,year,source:'Pop Crave',text:`NUMBER ONE ! ${artist.name} décroche la première place du classement mondial cette semaine.`})
    else weeklyPosts.push({id:id(),week,year,source:'Pop Base',text:`Dans les charts cette semaine : ${randomCompetitor} fait parler de lui, tandis que ${artist.name} poursuit son ascension.`})
    const wiki=[...artist.wiki,`Semaine ${week} de ${year} : ${fmt(weeklyStreams)} nouvelles écoutes enregistrées sur Spotify, Apple Music et YouTube.`,...updatedTracks.filter(t=>t.rank!==null).map(t=>`Semaine ${week} de ${year} : « ${t.title} » atteint la position ${t.rank} du classement mondial (meilleur classement : ${t.peak}).`)]
    const next={...artist,week,year,energy:Math.min(100,artist.energy+18),money:artist.money+net,fans:artist.fans+newFans,popularity:pop,tracks:updatedTracks,lastWeekStreams:weeklyStreams,spotifyFollowers:(artist.spotifyFollowers??Math.round(artist.fans*.72))+Math.round(newFans*.48),socialPosts:(artist.socialPosts??[]).map(p=>({...p,boostWeeks:Math.max(0,p.boostWeeks-1),views:p.views+Math.round(p.views*.08),likes:p.likes+Math.round(p.views*.004),comments:p.comments+Math.round(p.views*.0004)})),campaigns:(artist.campaigns??[]).map(c=>({...c,remainingWeeks:Math.max(0,c.remainingWeeks-1)})),contracts:settledContracts,label:activeContract?artist.label:(artist.ownLabelName??'Indépendant'),labelShare:activeContract?100-artistRoyaltyRate:0,releases,spotify:artist.spotify+platformDelta.spotify,apple:artist.apple+platformDelta.apple,youtube:artist.youtube+platformDelta.youtube,radio:artist.radio+platformDelta.radio,posts:[...weeklyPosts,...artist.posts].slice(0,80),wiki:wiki.slice(-150),chart,albumChart,marketCharts,chartHistory:chartHistory.slice(-300),merchItems,merch:artist.merch+merchUnits,merchRevenue:artist.merchRevenue+merchRevenue}
    setArtist(next);setNotice(`Semaine ${week} terminée : +${fmt(weeklyStreams)} écoutes, +${fmt(newFans)} fans et ${money(net)} de revenus nets.`)
  }
  function reset() {if(!window.confirm('Supprimer définitivement cette carrière et sa sauvegarde ?'))return;localStorage.removeItem(SAVE_KEY);localStorage.removeItem(OLD_KEY);setArtist(null);setTab('Vue d’ensemble');setNotice('')}
  const nav=[
    {label:'Vue d’ensemble',icon:Home},{label:'Applications',icon:Sparkles},{label:'Studio & sorties',icon:Mic2},{label:'Plateformes',icon:Headphones},
    {label:'Identité',icon:Users},{label:'Classements',icon:BarChart3},{label:'Promotion',icon:TrendingUp},{label:'Tournées',icon:Ticket},
    {label:'Labels',icon:Building2},{label:'Merch',icon:Shirt},{label:'Wikipédia',icon:Globe2},{label:'Médias & presse',icon:Newspaper}
  ]
  if(!artist)return <main className="welcome-screen"><div className="welcome-glow"/><div className="welcome-content"><div className="brand-mark"><Music2 size={22}/></div><p className="eyebrow">VOTRE HISTOIRE COMMENCE ICI</p><h1>La musique.<br/><span>Votre carrière.</span></h1><p className="welcome-copy">Créez votre artiste, choisissez votre point de départ et prenez les commandes de votre ascension dans l’industrie musicale.</p><form className="creation-card" onSubmit={createCareer}><div className="card-heading"><Sparkles size={18}/><span>Créer une nouvelle carrière</span></div><label>Nom d’artiste<input name="name" placeholder="Ex. : Nova" maxLength={32} required/></label><div className="form-row"><label>Genre musical<select name="genre">{genres.map(g=><option key={g}>{g}</option>)}</select></label><label>Pays<select name="country">{['France','États-Unis','Royaume-Uni','Canada','Belgique','Corée du Sud','Autre'].map(x=><option key={x}>{x}</option>)}</select></label></div><label>Âge (facultatif)<input name="age" type="number" min="13" max="100" placeholder="Ex. : 24"/></label><label>Photo / portrait (URL facultative)<input name="image" type="url" placeholder="https://…"/></label><div className="start-options"><p className="eyebrow">CHOISISSEZ VOTRE POINT DE DÉPART — TRICHE AUTORISÉE</p><label>Argent de départ <strong id="money-value">250 000 €</strong><input name="money" type="range" min="0" max="100000000" step="50000" defaultValue="250000" onInput={e=>{const el=document.getElementById('money-value');if(el)el.textContent=money(Number(e.currentTarget.value))}}/></label><label>Fans au départ <strong id="fans-value">1 200</strong><input name="fans" type="range" min="0" max="100000000" step="100" defaultValue="1200" onInput={e=>{const el=document.getElementById('fans-value');if(el)el.textContent=fmt(Number(e.currentTarget.value))}}/></label><label>Popularité <strong id="pop-value">8 / 100</strong><input name="popularity" type="range" min="0" max="100" defaultValue="8" onInput={e=>{const el=document.getElementById('pop-value');if(el)el.textContent=e.currentTarget.value+' / 100'}}/></label></div><button className="primary-button" type="submit">Lancer ma carrière <ChevronRight size={18}/></button><p className="form-footnote">Sauvegarde automatique sur cet appareil · Vous pourrez ajuster les règles plus tard.</p></form><div className="welcome-footer"><span>UNIVERS MUSICAL SIMULÉ</span><span>VERSION 1.1.0</span></div></div></main>

  const recent=artist.posts.slice(0,8)
  const total=artist.spotify+artist.apple+artist.youtube
  return <div className="app-shell"><aside className="sidebar"><div className="sidebar-brand"><div className="brand-mark small"><Music2 size={18}/></div><span>Music Career<br/><b>Simulator</b></span></div><div className="profile-mini">{artist.image?<img className="avatar-photo" src={artist.image} alt="Portrait de l’artiste"/>:<div className="avatar">{artist.name.slice(0,1).toUpperCase()}</div>}<div><strong>{artist.name}</strong><span>{artist.genre} · {artist.country}</span></div></div><p className="nav-caption">ESPACE ARTISTE</p><nav>{nav.map(item=><button key={item.label} className={tab===item.label?'nav-item active':'nav-item'} onClick={()=>setTab(item.label)}><item.icon size={17}/><span>{item.label}</span>{tab===item.label&&<span className="nav-dot"/>}</button>)}</nav><div className="sidebar-bottom"><div className="season-chip"><CalendarDays size={15}/><span>{dateLabel}</span></div><button className="settings-button" onClick={reset}><Settings2 size={16}/> Réinitialiser la partie</button><span className="version-label">MCS · VERSION 1.1</span></div></aside>
  <main className="main-area"><header className="topbar"><div><span className="breadcrumb">ESPACE ARTISTE</span><span className="breadcrumb-sep">/</span><strong>{tab}</strong></div><div className="topbar-right"><span className="live-indicator"><i/> Simulation active</span><button className="next-week" onClick={nextWeek}><Play size={14} fill="currentColor"/> Semaine suivante</button></div></header><div className="page-content">{notice&&<button className="notice" onClick={()=>setNotice('')}><Sparkles size={15}/>{notice}<span>×</span></button>}
  {tab==='Applications'&&<Ecosystem artist={artist} update={patch=>setArtist(current=>current?{...current,...patch}:current)} notify={setNotice}/> }
  <CareerModules tab={tab} artist={artist} update={patch=>setArtist(current=>current?{...current,...patch}:current)} notify={setNotice}/>
  {tab==='Vue d’ensemble'&&<><section className="page-intro"><div><p className="eyebrow">TABLEAU DE BORD · {dateLabel.toUpperCase()}</p><h1>Bonjour, {artist.name} <span>✦</span></h1><p>Votre carrière se développe sur tous les fronts.</p></div><div className="career-status"><span className="status-icon"><Star size={17}/></span><div><small>STATUT ACTUEL</small><strong>{artist.popularity>=75?'Icône mondiale':artist.popularity>=35?'Artiste confirmé':'Étoile montante'}</strong></div></div></section><section className="stats-grid"><Stat icon={Wallet} label="Trésorerie" value={money(artist.money)} note="Revenus cumulés et dépenses"/><Stat icon={Users} label="Communauté" value={fmt(artist.fans)} note="Fans dans le monde"/><Stat icon={Star} label="Popularité" value={artist.popularity.toFixed(1)+'/100'} note="Notoriété actuelle"/><Stat icon={Activity} label="Écoutes cumulées" value={fmt(total)} note="Spotify, Apple Music & YouTube"/></section><section className="platform-grid">{platforms.map(p=><div className="platform-card" key={p.key}><span className={'platform-logo '+p.cls}>{p.key==='spotify'?'●':p.key==='apple'?'♪':p.key==='youtube'?'▶':'◉'}</span><div><strong>{p.name}</strong><small>{fmt(artist[p.key])} {p.key==='radio'?'diffusions':'écoutes'}</small></div></div>)}</section><section className="dashboard-grid"><div className="panel spotlight-panel"><div className="panel-top"><div><p className="eyebrow">PROCHAINE ÉTAPE</p><h2>Développez votre discographie.</h2></div><div className="panel-icon"><Disc3 size={20}/></div></div><p>Écrivez, produisez et publiez vos morceaux. Leur succès alimentera automatiquement les plateformes, les médias et les classements.</p><button className="text-button" onClick={()=>setTab('Studio & sorties')}>Ouvrir le studio <ChevronRight size={16}/></button></div><div className="panel"><div className="panel-top"><div><p className="eyebrow">VOTRE LABEL</p><h2>{artist.label}</h2></div><Building2 className="muted-icon"/></div><p className="panel-description">{artist.label==='Indépendant'?'Vous gérez votre carrière en toute autonomie.':'Part du label sur les revenus : '+artist.labelShare+'%'}.</p><button className="text-button" onClick={()=>setTab('Labels')}>Gérer les contrats <ChevronRight size={16}/></button></div></section><section className="dashboard-grid"><div className="panel"><div className="panel-top"><div><p className="eyebrow">ACTUALITÉS</p><h2>Ce qui se dit sur vous</h2></div><Newspaper className="muted-icon"/></div>{recent.slice(0,4).map(p=><div className="feed-item" key={p.id}><span className="feed-source">{p.source}</span><p>{p.text}</p><small>Semaine {p.week} · {p.year}</small></div>)}</div><div className="panel"><div className="panel-top"><div><p className="eyebrow">DISCOGRAPHIE</p><h2>Vos dernières sorties</h2></div><span className="count-pill">{artist.releases.length} sorties</span></div>{artist.releases.slice(-4).reverse().map(r=><div className="song-row" key={r.id}><div className="song-art"><Disc3 size={17}/></div><div><strong>{r.title}</strong><small className="release-type">{r.type} · {r.year}</small></div><span className="song-state">{r.currentRank?'#'+r.currentRank:'NOUVEAU'}</span></div>)}{!artist.releases.length&&<div className="empty-state compact">Aucune sortie pour le moment.</div>}</div></section></>}
  {tab==='Plateformes'&&<><PageHeading eyebrow="DIFFUSION & AUDIENCE" title="Plateformes" subtitle="Les écoutes progressent automatiquement à chaque semaine simulée."/><div className="platform-grid large">{platforms.map(p=><div className="platform-card" key={p.key}><span className={'platform-logo '+p.cls}>{p.key==='spotify'?'●':p.key==='apple'?'♪':p.key==='youtube'?'▶':'◉'}</span><div><strong>{p.name}</strong><small>{fmt(artist[p.key])} {p.key==='radio'?'diffusions':'écoutes'}</small><b>{money(artist[p.key]*p.rate)} estimés</b></div></div>)}</div><div className="panel"><p className="eyebrow">RÉPARTITION DES ÉCOUTES</p><h2>Votre audience cumulée</h2><div className="stream-bars">{[{name:'Spotify',value:artist.spotify,color:'#269b68'},{name:'Apple Music',value:artist.apple,color:'#bd7a9d'},{name:'YouTube',value:artist.youtube,color:'#d85b5b'}].map(x=><div className="stream-row" key={x.name}><span>{x.name}</span><div><i style={{width:`${total?x.value/total*100:0}%`,background:x.color}}/></div><b>{fmt(x.value)}</b></div>)}</div><p className="panel-description">Les montants sont des estimations fictives pour le jeu. Les revenus réels varient selon les contrats et les territoires.</p></div></>}
  </div></main></div>
}
function Stat({icon:Icon,label,value,note}:{icon:typeof Wallet;label:string;value:string;note:string}){return <div className="stat-card"><div className="stat-top"><span>{label}</span><div className="stat-icon"><Icon size={17}/></div></div><strong>{value}</strong><small>{note}</small></div>}
function PageHeading({eyebrow,title,subtitle}:{eyebrow:string;title:string;subtitle:string}){return <section className="page-intro simple"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{subtitle}</p></div></section>}
export default App
