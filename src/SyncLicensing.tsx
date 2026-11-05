import { useMemo, useState } from 'react'
import type { Artist, SyncDeal } from './App'
import { Clapperboard, CheckCircle2, Clock3, Film, Gamepad2, Megaphone, Music2, Tv } from 'lucide-react'

type Props={artist:Artist;update:(patch:Partial<Artist>)=>void;notify:(message:string)=>void}
const euro=(n:number)=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(Math.round(n))
const uid=()=>Math.random().toString(36).slice(2,10)
const opportunities=[
 {client:'Northstar Pictures',format:'Long-métrage',kind:'film',multiplier:1.55,icon:Film,description:'Une production cinéma cherche un titre pour une séquence émotionnelle.'},
 {client:'Studio Meridian',format:'Série premium',kind:'series',multiplier:1.2,icon:Tv,description:'Une série en préparation souhaite intégrer un morceau à sa bande originale.'},
 {client:'Éclipse Mobile',format:'Campagne publicitaire',kind:'publicité',multiplier:2.15,icon:Megaphone,description:'Une marque prépare une campagne internationale avec un budget musical élevé.'},
 {client:'Pixel Forge',format:'Jeu vidéo',kind:'jeu vidéo',multiplier:1.35,icon:Gamepad2,description:'Un studio recherche un titre pour une scène et les contenus promotionnels du jeu.'}
]
export default function SyncLicensing({artist,update,notify}:Props){
 const tracks=artist.tracks.filter(t=>t.released)
 const deals=artist.syncDeals??[]
 const [opportunityFilter,setOpportunityFilter]=useState('Tous')
 const offers=useMemo(()=>tracks.slice().sort((a,b)=>b.total-a.total).slice(0,8).flatMap((track)=>{
  const release=artist.releases.find(r=>!r.editionOf&&r.trackIds.includes(track.id))??artist.releases.find(r=>r.trackIds.includes(track.id))
  const masterContractId=track.masterContractId??release?.masterContractId??release?.labelContractId
  const masterContract=(artist.contracts??[]).find(c=>c.id===masterContractId)
  const publishingContractId=track.publishingContractId??release?.publishingContractId??masterContractId
  const publishingContract=(artist.contracts??[]).find(c=>c.id===publishingContractId)
  const rawOwner=track.masterOwnership??release?.masterOwnership??masterContract?.masterOwnership??'artist'
  const masterOwner=rawOwner==='license'?'artist':rawOwner
  const masterArtistShare=masterOwner==='artist'?100:masterOwner==='shared'?(track.masterArtistShare??release?.masterArtistShare??masterContract?.artistMasterShare??50):(masterContract?.artistRoyalty??(masterContract?100-masterContract.royalty:0))
  const publishingOwner=track.publishingOwnership??release?.publishingOwnership??publishingContract?.publishingOwnership??'artist'
  const publishingArtistShare=track.artistPublishingShare??release?.artistPublishingShare??(publishingOwner==='artist'?100:publishingOwner==='shared'?(publishingContract?.artistPublishingShare??50):0)
  const popularityFactor=1+artist.popularity/100
  const catalogueFactor=1+Math.log10(track.total+1)*.16
  return opportunities.map((op)=>{
   const fee=Math.max(1200,Math.round((850+artist.popularity*38+Math.log10(track.total+1)*115+Math.min(600,artist.fans/120))*op.multiplier*popularityFactor*catalogueFactor/100)*100)
   const already=deals.some(d=>d.trackId===track.id&&d.client===op.client)
   return {id:track.id+'-'+op.kind,track,op,fee,already,masterArtistAmount:fee*.5*masterArtistShare/100,publishingArtistAmount:fee*.5*publishingArtistShare/100,labelMasterAmount:fee*.5*(1-masterArtistShare/100),labelPublishingAmount:fee*.5*(1-publishingArtistShare/100),contractId:masterContractId}
  })
 }),[tracks,artist.releases,artist.contracts,artist.popularity,artist.fans,deals])
 function accept(offer:typeof offers[number]){
  if(offer.already)return
  const paymentWeek=artist.week>=52?1:artist.week+1
  const paymentYear=artist.week>=52?artist.year+1:artist.year
  const deal:SyncDeal={id:uid(),trackId:offer.track.id,trackTitle:offer.track.title,client:offer.op.client,format:offer.op.format,fee:offer.fee,paymentWeek,paymentYear,acceptedWeek:artist.week,acceptedYear:artist.year,artistMasterAmount:offer.masterArtistAmount,artistPublishingAmount:offer.publishingArtistAmount,labelMasterAmount:offer.labelMasterAmount,labelPublishingAmount:offer.labelPublishingAmount,contractId:offer.contractId,status:'pending'}
  update({syncDeals:[...deals,deal]})
  notify('Accord de synchronisation signé pour « '+offer.track.title+' ». Paiement prévu en semaine '+paymentWeek+' · '+paymentYear+'.')
 }
 const pending=deals.filter(d=>d.status==='pending')
 const paid=deals.filter(d=>d.status==='paid')
 const artistPaid=paid.reduce((sum,d)=>sum+(d.artistMasterAmount??0)+(d.artistPublishingAmount??0),0)
 const artistPending=pending.reduce((sum,d)=>sum+(d.artistMasterAmount??0)+(d.artistPublishingAmount??0),0)
 const filteredOffers=offers.filter(o=>opportunityFilter==='Tous'||o.op.kind===opportunityFilter)
 const availableOffers=filteredOffers.filter(o=>!o.already).length
 return <div className="sync-licensing mx-sync-page">
  <header className="module-intro mx-sync-hero"><div><p className="eyebrow">MUSIC SUPERVISION · LICENSING DESK</p><h1>Synchronisations</h1><p>Votre catalogue rencontre l’image. Gérez les demandes de licences, suivez les signatures et surveillez les revenus générés par vos masters et vos éditions.</p><span className="sync-hero-footnote">PLACEMENTS · AUDIOVISUEL · PUBLICITÉ · GAMING</span></div><div className="sync-hero-aside"><small>CATALOGUE ÉLIGIBLE</small><strong>{tracks.length.toString().padStart(2,'0')}</strong><span>titres disponibles</span></div></header>
  <section className="stats-grid mx-sync-stats">
   <div className="stat-card"><div className="stat-top"><span>Accords signés</span><div className="stat-icon"><Clapperboard size={17}/></div></div><strong>{deals.length}</strong><small>Contrats de synchronisation</small></div>
   <div className="stat-card"><div className="stat-top"><span>Paiements reçus</span><div className="stat-icon"><CheckCircle2 size={17}/></div></div><strong>{euro(artistPaid)}</strong><small>Revenus nets attribués à l’artiste</small></div>
   <div className="stat-card"><div className="stat-top"><span>En attente</span><div className="stat-icon"><Clock3 size={17}/></div></div><strong>{euro(artistPending)}</strong><small>Part artiste en attente de règlement</small></div>
   <div className="stat-card"><div className="stat-top"><span>Catalogue éligible</span><div className="stat-icon"><Music2 size={17}/></div></div><strong>{tracks.length}</strong><small>Enregistrements publiés</small></div>
  </section>
  <section className="panel">
   <div className="panel-top"><div><p className="eyebrow">APPELS À LICENCES</p><h2>Opportunités disponibles</h2></div><span className="count-pill">{offers.filter(o=>!o.already).length} offres</span></div>
   <p className="panel-description">Les montants sont des propositions fictives calculées selon votre popularité et les performances du titre. Un accord est non exclusif, mondial et valable cinq ans. Le paiement intervient la semaine suivante, après validation des ayants droit.</p>
   <div className="sync-market-toolbar"><div><b>{availableOffers} opportunité(s) à étudier</b><small>Filtrez par type de production</small></div><div className="sync-market-filters">{[{id:'Tous',label:'Tout'},{id:'film',label:'Cinéma'},{id:'series',label:'Séries'},{id:'publicité',label:'Publicité'},{id:'jeu vidéo',label:'Jeux vidéo'}].map(f=><button type="button" key={f.id} className={opportunityFilter===f.id?'selected':''} onClick={()=>setOpportunityFilter(f.id)}>{f.label}</button>)}</div></div>
   {offers.length?<div className="sync-market-grid">{filteredOffers.map(offer=>{const Icon=offer.op.icon;return <article className="sync-offer-card" key={offer.id}><div className="sync-offer-top"><span className="sync-offer-icon"><Icon size={19}/></span><span className="sync-offer-format">{offer.op.format}</span></div><p className="eyebrow">{offer.op.client}</p><h3>{offer.track.title}</h3><p>{offer.op.description}</p><div className="sync-offer-meta"><span>Part artiste · master <b>{euro(offer.masterArtistAmount)}</b></span><span>Part artiste · édition <b>{euro(offer.publishingArtistAmount)}</b></span></div><div className="sync-offer-fee"><small>Valeur totale de la licence</small><strong>{euro(offer.fee)}</strong></div><button className="mini-action" disabled={offer.already} onClick={()=>accept(offer)}>{offer.already?'Accord déjà signé':'Accepter la licence'}</button></article>})}</div>:<div className="empty-state"><Music2 size={26}/><b>Aucun titre disponible</b><span>Publiez d’abord un single ou un album pour proposer vos morceaux aux productions.</span></div>}
  </section>
  <section className="panel">
   <div className="panel-top"><div><p className="eyebrow">SUIVI CONTRACTUEL</p><h2>Vos accords</h2></div><span className="count-pill">{paid.length} réglé(s) · {pending.length} en attente</span></div>
   {deals.length?<div className="module-list">{deals.slice().reverse().map(d=><div className="module-list-row sync-deal-row" key={d.id}><span><b>{d.trackTitle} · {d.client}</b><small>{d.format} · Signé S{d.acceptedWeek} {d.acceptedYear} · Master et édition ventilés séparément</small></span><span className="sync-deal-status">{d.status==='paid'?'Payé':'À payer S'+d.paymentWeek+' '+d.paymentYear}</span><strong>{euro(d.fee)}</strong></div>)}</div>:<div className="empty-state"><Clapperboard size={25}/><b>Aucun accord pour le moment</b><span>Acceptez une opportunité pour commencer à exploiter votre catalogue en synchronisation.</span></div>}
  </section>
  <p className="panel-description">La part artiste et la part du label sont calculées à partir des droits détenus sur chaque enregistrement. La moitié de la licence rémunère le master, l’autre moitié l’édition. La part master artiste peut participer au recoupement de l’avance du contrat concerné ; les droits d’édition n’y participent pas.</p>
 </div>
}
