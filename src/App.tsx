import { useEffect, useMemo, useState, type FormEvent } from 'react'
import Ecosystem from './Ecosystem'
import CareerModules from './CareerModules'
import LabelStudio from './LabelStudio'
import Discography from './Discography'
import SyncLicensing from './SyncLicensing'
import { buildMarketCharts, getRivalMarketEvent, type MarketCharts } from './careerData'
import {
  BarChart3, ChevronRight, Disc3, RotateCcw, Clapperboard,
  Headphones, Home, Mic2, Music2, Settings2, Sparkles, Star,
  Users, Wallet, Play, Building2,
  TrendingUp, Ticket, Shirt, Newspaper, ArrowUpRight, Activity
} from 'lucide-react'

type Track = { id: string; title: string; released: boolean; masterOwnership?:'label'|'artist'|'shared'|'license'; masterArtistShare?:number; masterLicense?:'none'|'exclusive'|'non-exclusive'; masterContractId?:string; publishingOwnership?:'label'|'artist'|'shared'; artistPublishingShare?:number; publishingContractId?:string; spotify: number; apple: number; youtube: number; radio: number; total: number; rank: number | null; peak: number | null }
type Release = { id: string; title: string; type: 'Single' | 'Album'; format?: string; editionOf?:string; editionNumber?:number; coverArt?: string; trackIds: string[]; week: number; year: number; firstWeekStreams: number; firstWeekRecorded?: boolean; currentRank: number | null; peak: number | null; masterOwnership?:'label'|'artist'|'shared'|'license'; masterArtistShare?:number; masterLicense?:'none'|'exclusive'|'non-exclusive'; publishingOwnership?:'label'|'artist'|'shared'; artistPublishingShare?:number; publishingContractId?:string; labelContractId?:string; masterContractId?:string; territories?:string[] }
type FeedPost = { id: string; week: number; year: number; source: string; text: string }
type CareerEventChoice={id:string;label:string;detail:string;money:number;fans:number;popularity:number;energy:number;result:string;streamBoost?:number;boostWeeks?:number}
type CareerEvent={id:string;title:string;category:string;description:string;choices:CareerEventChoice[]}
type CareerBoost={id:string;label:string;multiplier:number;remainingWeeks:number}
export type SyncDeal = {id:string;trackId:string;trackTitle:string;client:string;format:string;fee:number;paymentWeek:number;paymentYear:number;acceptedWeek:number;acceptedYear:number;artistMasterAmount:number;artistPublishingAmount:number;labelMasterAmount:number;labelPublishingAmount:number;contractId?:string;status:'pending'|'paid'}
export type SocialPublication = { id:string; platform:'X'|'Instagram'|'TikTok'; kind:string; text:string; week:number; year:number; views:number; likes:number; comments:number; shares:number; boostWeeks:number; boost:number; mediaData?:string; mediaType?:string }
export type FinanceWeek = {week:number;year:number;spotifyStreams:number;appleStreams:number;youtubeStreams:number;radioPlays:number;spotifyRevenue:number;appleRevenue:number;youtubeRevenue:number;radioRevenue:number;streamingGross:number;publishingRevenue:number;publishingGross?:number;labelPublishingShare?:number;syncGross?:number;syncArtistShare?:number;syncLabelShare?:number;merchGross:number;merchCosts:number;tourGross:number;tourCosts?:number;artistShare:number;labelShare:number;distributionFee:number;marketingSpend?:number;managementFee?:number;labelMerchShare?:number;labelLiveShare?:number;artistMerchShare?:number;artistLiveShare?:number;recouped:number;net:number;contractRecoupments?:{contractId:string;label:string;amount:number;balanceAfter:number}[]}
type ChartEntry = { name: string; artist: string; streams: number; own: boolean; rank: number; releaseId?: string; trackId?: string }
type TourShow = { id: string; city: string; venue: string; capacity: number; sold: number; revenue: number; week: number; year: number; country?: string; productionCost?:number; ticketPrice?: number; vipPrice?: number; tourTitle?: string; setlist?: string[]; associatedAlbum?: string }
export type LabelContract = {
  id:string; label:string; dealType?:string; years:number; projects:number; remainingProjects?:number; remainingWeeks?:number; types:string[]; obligations?:{format:'Single'|'EP'|'Album studio'|'Album deluxe'|'Réédition'|'Compilation'|'Album live';required:number;remaining:number}[]; legacyRemainingProjects?:number;
  royalty:number; artistRoyalty?:number; advance:number; marketing:number; recordingBudget?:number; recoupableBalance?:number; recoupableTotal?:number; recoupedTotal?:number;
  masterOwnership?:'label'|'artist'|'shared'|'license'; artistMasterShare?:number; masterLicense?:'none'|'exclusive'|'non-exclusive'; publishingOwnership?:'label'|'artist'|'shared'; artistPublishingShare?:number; distributionFee?:number;
  territories?:string[]; exclusive?:boolean; creativeControl?:number; threeSixtyShare?:number; merchShare?:number; liveShare?:number;
  signedWeek?:number; signedYear?:number; terminationFee?:number; status?:'active'|'expired'|'terminated';
}
export type Artist = {
  name: string; genre: string; country: string; image: string
  energy: number; money: number; fans: number; popularity: number
  week: number; year: number; tracks: Track[]; releases: Release[]
  spotify: number; apple: number; youtube: number; radio: number
  posts: FeedPost[]; wiki: string[]; chart: ChartEntry[]; albumChart: ChartEntry[]; chartHistory: {week:number;year:number;rank:number;title:string}[]
  label: string; labelShare: number; tour: TourShow[]; merch: number; merchRevenue: number
  socialAccounts?: {instagram:number;x:number;tiktok:number}; socialPosts?: SocialPublication[]; spotifyFollowers?:number; lastWeekStreams?:number; campaigns?:{id:string;name:string;remainingWeeks:number;multiplier:number;releaseId?:string;budget?:number;weeklyCost?:number;spent?:number;startedWeek?:number;startedYear?:number}[]
  age?:number; bio?:string; financeHistory?:FinanceWeek[]; marketCharts?:MarketCharts; draftReleases?:{id:string;title:string;format:string;trackIds:string[];week:number;year:number}[]; contracts?:LabelContract[]; syncDeals?:SyncDeal[]; pendingEvent?:CareerEvent; careerBoosts?:CareerBoost[]
  merchItems?:{id:string;name:string;kind:string;price:number;cost:number;releaseId:string;active:boolean;sold:number}[]; manager?:string; managerContract?:{commission:number;streamBoost:number;fanBonus:number;remainingWeeks:number;signingFee:number}; ownLabelName?:string; ownLabelCapital?:number; ownLabelReputation?:number; ownLabelArtists?:{id:string;name:string;genre:string;popularity:number;fans:number;artistRoyalty:number;advance:number;remainingWeeks:number;streams:number;revenue:number;recoupableBalance?:number;artistEarnings?:number}[]; tourName?:string
}
const SAVE_KEY = 'music-career-simulator-save-v2'
const OLD_KEY = 'music-career-simulator-save-v1'
const BACKUP_KEY = 'music-career-simulator-save-backup-v2'
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
function normalizeSave(value:unknown):Artist|null {
  if(!value||typeof value!=='object')return null
  const a=value as Partial<Artist>
  if(typeof a.name!=='string'||!a.name.trim())return null
  const num=(v:unknown,fallback=0)=>typeof v==='number'&&Number.isFinite(v)?v:fallback
  const tracks=Array.isArray(a.tracks)?a.tracks.filter(t=>!!t&&typeof t==='object').map(t=>({...t,spotify:Number.isFinite(t.spotify)?t.spotify:0,apple:Number.isFinite(t.apple)?t.apple:0,youtube:Number.isFinite(t.youtube)?t.youtube:0,radio:Number.isFinite(t.radio)?t.radio:0,total:Number.isFinite(t.total)?t.total:0,rank:typeof t.rank==='number'?t.rank:null,peak:typeof t.peak==='number'?t.peak:null,released:!!t.released})): []
  const releases=Array.isArray(a.releases)?a.releases.filter(r=>!!r&&typeof r==='object').map(r=>({...r,trackIds:Array.isArray(r.trackIds)?[...new Set(r.trackIds.filter((trackId):trackId is string=>typeof trackId==='string'&&trackId.length>0))]:[],editionOf:typeof r.editionOf==='string'&&r.editionOf.length>0?r.editionOf:undefined,editionNumber:typeof r.editionNumber==='number'&&Number.isInteger(r.editionNumber)&&r.editionNumber>1?r.editionNumber:undefined,firstWeekStreams:Number.isFinite(r.firstWeekStreams)?r.firstWeekStreams:0})): []
  return {...a,name:a.name,genre:typeof a.genre==='string'?a.genre:'Pop',country:typeof a.country==='string'?a.country:'France',image:typeof a.image==='string'?a.image:'',energy:num(a.energy),money:num(a.money),fans:num(a.fans),popularity:num(a.popularity),week:Math.max(1,num(a.week,1)),year:Math.max(1,num(a.year,2026)),spotify:num(a.spotify),apple:num(a.apple),youtube:num(a.youtube),radio:num(a.radio),label:typeof a.label==='string'?a.label:'Indépendant',labelShare:num(a.labelShare),merch:num(a.merch),merchRevenue:num(a.merchRevenue),tracks,releases,posts:Array.isArray(a.posts)?a.posts.filter(p=>!!p&&typeof p==='object'):[],wiki:Array.isArray(a.wiki)?a.wiki.filter(p=>typeof p==='string'):[],chart:Array.isArray(a.chart)?a.chart.filter(p=>!!p&&typeof p==='object'):[],albumChart:Array.isArray(a.albumChart)?a.albumChart.filter(p=>!!p&&typeof p==='object'):[],chartHistory:Array.isArray(a.chartHistory)?a.chartHistory.filter(p=>!!p&&typeof p==='object'):[],financeHistory:Array.isArray(a.financeHistory)?a.financeHistory.filter(p=>!!p&&typeof p==='object').slice(-104) as FinanceWeek[]:[],tour:Array.isArray(a.tour)?a.tour.filter(p=>!!p&&typeof p==='object'):[],contracts:Array.isArray(a.contracts)?a.contracts.filter(c=>!!c&&typeof c==='object').map(c=>({...c,legacyRemainingProjects:c.legacyRemainingProjects??(!c.obligations?.length?(c.remainingProjects??c.projects):0)})) : [],syncDeals:Array.isArray(a.syncDeals)?a.syncDeals.filter(d=>!!d&&typeof d==='object'&&typeof d.id==='string'&&typeof d.trackId==='string'&&Number.isFinite(d.fee)&&Number.isFinite(d.paymentWeek)&&Number.isFinite(d.paymentYear)):[],careerBoosts:Array.isArray(a.careerBoosts)?a.careerBoosts.filter(b=>!!b&&typeof b==='object'&&typeof b.id==='string'&&Number.isFinite(b.multiplier)&&Number.isFinite(b.remainingWeeks)&&b.remainingWeeks>0):[]} as Artist
}
function saveLoad(): Artist | null {
  for(const key of [SAVE_KEY,BACKUP_KEY]) {
    try {
      const raw=localStorage.getItem(key)
      if(raw) {
        const parsed=normalizeSave(JSON.parse(raw))
        if(parsed)return parsed
      }
    } catch { /* try the next recoverable save */ }
  }
  try {
    const old=localStorage.getItem(OLD_KEY)
    if(old) {
      const a=JSON.parse(old)
      return normalizeSave({...a,image:'',tracks:(a.songs||[]).map((title:string)=>({id:id(),title,released:false,spotify:0,apple:0,youtube:0,radio:0,total:0,rank:null,peak:null})),releases:[],spotify:0,apple:0,youtube:0,radio:0,posts:[],wiki:['La carrière de '+a.name+' débute dans l’industrie musicale.'],chart:[],albumChart:[],chartHistory:[],label:'Indépendant',labelShare:0,tour:[],merch:0,merchRevenue:0})
    }
  } catch { return null }
  return null
}
function App() {
  const [artist,setArtist]=useState<Artist|null>(()=>saveLoad())
  const [tab,setTab]=useState('Vue d’ensemble')
  const [notice,setNotice]=useState('')

  useEffect(()=>{if(!artist)return;try{const next=JSON.stringify(artist),previous=localStorage.getItem(SAVE_KEY);if(previous&&previous!==next){try{if(normalizeSave(JSON.parse(previous)))localStorage.setItem(BACKUP_KEY,previous)}catch{/* Never replace a valid backup with corrupt data. */}}localStorage.setItem(SAVE_KEY,next)}catch{/* A full browser quota must not crash the simulation. */}},[artist])
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
  function restoreBackup() {
    try {
      const raw=localStorage.getItem(BACKUP_KEY)
      if(!raw){setNotice('Aucune sauvegarde précédente disponible.');return}
      const restored=normalizeSave(JSON.parse(raw))
      if(!restored){setNotice('La sauvegarde précédente est illisible. Votre carrière actuelle est conservée.');return}
      const current=localStorage.getItem(SAVE_KEY)
      if(current)localStorage.setItem('music-career-simulator-save-before-restore',current)
      localStorage.setItem(SAVE_KEY,JSON.stringify(restored))
      setArtist(restored)
      setNotice('Sauvegarde précédente restaurée. Votre état juste avant la restauration reste conservé séparément.')
    } catch {setNotice('Impossible de restaurer la sauvegarde. Votre carrière actuelle est conservée.')}
  }
  function nextWeek() {
    if(!artist||artist.pendingEvent)return
    const week=artist.week>=52?1:artist.week+1,year=artist.week>=52?artist.year+1:artist.year
    const active=artist.tracks.filter(t=>t.released)
    const popularityFactor=.45+artist.popularity/45
    const weekly=active.map((t,i)=>{
      const age=artist.releases.find(r=>r.trackIds.includes(t.id))
      const weeksOld=age?Math.max(0,(artist.year-age.year)*52+artist.week-age.week):0
      const decay=Math.max(.16,1-weeksOld*.045)
      const seed=Math.abs(Math.sin((week+year+i*13)*91.7))
      const managerBoost=artist.managerContract&&artist.managerContract.remainingWeeks>0?artist.managerContract.streamBoost:1
      const socialBoost=Math.min(2.5,(artist.socialPosts??[]).filter(p=>p.boostWeeks>0).reduce((v,p)=>v*p.boost,1))
      const campaignBoost=Math.min(2,(artist.campaigns??[]).filter(c=>c.remainingWeeks>0&&(!c.releaseId||artist.releases.some(r=>r.id===c.releaseId&&r.trackIds.includes(t.id)))).reduce((v,c)=>v*c.multiplier,1))
      const careerBoost=Math.min(1.8,(artist.careerBoosts??[]).filter(b=>b.remainingWeeks>0).reduce((v,b)=>v*b.multiplier,1))

    const showsThisWeek=artist.tour.filter(s=>s.week===week&&s.year===year)
      const tourBoost=showsThisWeek.length?1.18:1
      const setlistBoost=showsThisWeek.some(s=>s.setlist?.includes(t.id))?1.22:1
      const albumTourBoost=showsThisWeek.some(s=>s.associatedAlbum&&artist.releases.some(r=>r.id===s.associatedAlbum&&r.trackIds.includes(t.id)))?1.12:1
      const base=Math.round((artist.fans*.55+artist.popularity*210)*popularityFactor*decay*(.72+seed*.58)*managerBoost*socialBoost*campaignBoost*careerBoost*tourBoost*setlistBoost*albumTourBoost)
      const spotify=Math.round(base*.64),apple=Math.round(base*.23),youtube=Math.round(base*.13)
      const radio=Math.round(base*(artist.popularity/100)*.08)
      return {...t,spotify:t.spotify+spotify,apple:t.apple+apple,youtube:t.youtube+youtube,radio:t.radio+radio,total:t.total+spotify+apple+youtube,rank:null as number|null}
    })
    const weeklyStreams=weekly.reduce((s,t)=>s+(t.spotify+t.apple+t.youtube-(artist.tracks.find(x=>x.id===t.id)?.spotify||0)-(artist.tracks.find(x=>x.id===t.id)?.apple||0)-(artist.tracks.find(x=>x.id===t.id)?.youtube||0)),0)
    const competitorEntries=Array.from({length:99},(_,i)=>{
      const n=i+1,seed=Math.abs(Math.sin((year*52+week+n*19)*7.31))
      return {name:['Neon Hearts','Golden Hour','Afterglow','Satellite','Wildflower','Blue','Midnight City','Heartbeat'][n%8]+' '+n,artist:competitors[n%competitors.length],streams:Math.round((19000000/(n**.78))*(.75+seed*.55)),own:false,rank:0}
    })
    const ownEntries=weekly.map(t=>({name:t.title,artist:artist.name,trackId:t.id,streams:Math.max(1,Math.round(t.spotify+t.apple+t.youtube-(artist.tracks.find(x=>x.id===t.id)?.spotify||0)-(artist.tracks.find(x=>x.id===t.id)?.apple||0)-(artist.tracks.find(x=>x.id===t.id)?.youtube||0))),own:true,rank:0}))
    const chart:ChartEntry[]=[...competitorEntries,...ownEntries].sort((a,b)=>b.streams-a.streams).slice(0,100).map((x,i)=>({...x,rank:i+1}))
    const albumCompetitors=Array.from({length:99},(_,i)=>{const n=i+1,seed=Math.abs(Math.sin((year*19+week+n*31)*3.17));return {name:['Golden Hour','Blue Skies','The Other Side','Afterglow','Electric Dreams'][n%5]+' — '+n,artist:competitors[(n+2)%competitors.length],streams:Math.round((28000000/(n**.82))*(.7+seed*.6)),own:false,rank:0}})
    const ownAlbums=artist.releases.filter(r=>r.type==='Album').map(r=>({name:r.title,artist:artist.name,releaseId:r.id,streams:r.trackIds.reduce((sum,trackId)=>{const now=weekly.find(t=>t.id===trackId),old=artist.tracks.find(t=>t.id===trackId);return sum+(now?now.total-(old?.total||0):0)},0),own:true,rank:0}))
    const albumChart:ChartEntry[]=[...albumCompetitors,...ownAlbums].sort((a,b)=>b.streams-a.streams).slice(0,100).map((x,i)=>({...x,rank:i+1}))
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
      const firstWeekRecorded=r.firstWeekRecorded??((r.firstWeekStreams??0)>0||r.week!==artist.week||r.year!==artist.year)
      const firstWeekStreams=firstWeekRecorded?(r.firstWeekStreams??0):releaseTracks.reduce((sum,t)=>sum+(t.total-(artist.tracks.find(old=>old.id===t.id)?.total??0)),0)
      const rank=(r.type==='Album'?albumChart.find(c=>c.own&&c.releaseId===r.id)?.rank:chart.find(c=>c.own&&releaseTracks.some(t=>t.id===c.trackId))?.rank)??null
      return {...r,firstWeekStreams,firstWeekRecorded:true,currentRank:rank,peak:rank===null?r.peak:Math.min(r.peak??rank,rank)}
    })
    const marketCharts=buildMarketCharts(artist,updatedTracks,week,year,artist.marketCharts)
    const marketStories:FeedPost[]=[]
    const industryEvent=getRivalMarketEvent(week,year)
    if(industryEvent?.headline){
      const eventText=industryEvent.kind==='viral'
        ?industryEvent.artist+' signe un phénomène viral : son nouveau single bénéficie d’un puissant regain d’écoutes pendant plusieurs semaines.'
        :industryEvent.kind==='blockbuster'
          ?industryEvent.artist+' lance un album événement. Ses ventes d’écoutes progressent fortement et captent une part supplémentaire de l’attention du marché.'
          :industryEvent.artist+' connaît un retour inattendu : un ancien titre ressort du catalogue et retrouve une forte visibilité.'
      marketStories.push({id:id(),week,year,source:'Événement de l’industrie',text:eventText})
    }
    for(const [code,label] of [['US','États-Unis'],['UK','Royaume-Uni'],['FR','France']] as const){
      const board=marketCharts[code]
      const albumDebut=board.albums.filter(x=>!x.own&&x.isNew&&x.rank<=20&&x.id.includes('-album-era-')).sort((a,b)=>a.rank-b.rank)[0]
      if(artist.marketCharts?.[code]&&albumDebut)marketStories.push({id:id(),week,year,source:'Sorties · '+label,text:'Nouvel album dans le top 20 en '+label+' : « '+albumDebut.name+' » de '+albumDebut.artist+' démarre à la position #'+albumDebut.rank+'.'})
      const collaboration=board.songs.filter(x=>!x.own&&x.isNew&&x.rank<=40&&x.artist.includes(' feat. ')).sort((a,b)=>a.rank-b.rank)[0]
      if(artist.marketCharts?.[code]&&collaboration)marketStories.push({id:id(),week,year,source:'Collaborations · '+label,text:'Collaboration remarquée en '+label+' : « '+collaboration.name+' » réunit '+collaboration.artist+' et entre directement à la position #'+collaboration.rank+'.'})
      const songLeader=board.songs[0]
      if(songLeader&&!songLeader.own&&songLeader.lastWeek!==1&&songLeader.rank===1)marketStories.push({id:id(),week,year,source:'Charts · '+label,text:'Nouveau numéro un en '+label+' : « '+songLeader.name+' » de '+songLeader.artist+' prend la tête du classement des chansons.'})
      const climber=board.songs.filter(x=>!x.own&&x.lastWeek!==null).sort((a,b)=>(b.lastWeek!-b.rank)-(a.lastWeek!-a.rank))[0]
      if(climber&&climber.lastWeek!==null&&climber.lastWeek-climber.rank>=12)marketStories.push({id:id(),week,year,source:'Charts · '+label,text:'Belle remontée en '+label+' : « '+climber.name+' » de '+climber.artist+' gagne '+(climber.lastWeek-climber.rank)+' places et atteint le #'+climber.rank+'.'})
      // La concurrence a désormais un effet narratif direct sur les sorties du joueur.
      const previousSongs=artist.marketCharts?.[code]?.songs??[]
      for(const prior of previousSongs.filter(x=>x.own)){
        const current=board.songs.find(x=>x.id===prior.id)
        if(!current){
          marketStories.push({id:id(),week,year,source:'Concurrence · '+label,text:'« '+prior.name+' » quitte le top 100 en '+label+'. La pression des nouvelles sorties devient plus forte.'})
          continue
        }
        if(current.rank-prior.rank>=12){
          const newRival=board.songs.find(x=>!x.own&&x.rank<current.rank&&x.lastWeek!==null&&x.lastWeek>prior.rank)
          marketStories.push({id:id(),week,year,source:'Concurrence · '+label,text:'La concurrence se renforce en '+label+' : « '+current.name+' » recule de '+(current.rank-prior.rank)+' places'+(newRival?', notamment face à '+newRival.artist:'')+'.'})
        }
        const overtaker=board.songs.find(x=>!x.own&&x.rank<current.rank&&x.lastWeek!==null&&x.lastWeek>prior.rank)
        if(overtaker&&prior.rank<overtaker.lastWeek!){
          marketStories.push({id:id(),week,year,source:'Rivalité · '+label,text:overtaker.artist+' dépasse « '+current.name+' » en '+label+' et prend la position #'+overtaker.rank+'.'})
        }
      }
      const ownArtist=board.artists.find(x=>x.own)
      if(ownArtist&&ownArtist.rank<=10&&(ownArtist.lastWeek===null||ownArtist.lastWeek>10))marketStories.push({id:id(),week,year,source:'Charts · '+label,text:artist.name+' entre dans le top 10 des artistes en '+label+', à la position #'+ownArtist.rank+'.'})
    }
    // Les clauses restent applicables pendant toute la semaine qui vient de commencer.
    // On calcule donc les revenus avec le contrat avant de décrémenter sa durée.
    const activeContract=(artist.contracts??[]).find(c=>(c.remainingWeeks??c.years*52)>0&&(c.status??'active')==='active')
    const contracts=(artist.contracts??[]).map(c=>({...c,remainingWeeks:Math.max(0,(c.remainingWeeks??c.years*52)-1),status:(c.status==='terminated'?'terminated':(c.remainingWeeks??c.years*52)<=1?'expired':c.status??'active') as LabelContract['status']}))
    const breachedContracts=contracts.filter(c=>c.status==='expired'&&(artist.contracts??[]).some(old=>old.id===c.id&&(old.status??'active')==='active'&&((old.obligations??[]).reduce((sum,o)=>sum+Math.max(0,o.remaining),0)+(old.legacyRemainingProjects??0))>0))
    const breachPenalty=Math.min(3.5,breachedContracts.reduce((sum,c)=>sum+Math.max(0,(artist.contracts??[]).find(old=>old.id===c.id)?.obligations?.reduce((n,o)=>n+Math.max(0,o.remaining),0)??0)*0.65+Math.max(0,(artist.contracts??[]).find(old=>old.id===c.id)?.legacyRemainingProjects??0)*0.65,0))
    const platformDelta={spotify:updatedTracks.reduce((s,t)=>s+(t.spotify-(artist.tracks.find(x=>x.id===t.id)?.spotify||0)),0),apple:updatedTracks.reduce((s,t)=>s+(t.apple-(artist.tracks.find(x=>x.id===t.id)?.apple||0)),0),youtube:updatedTracks.reduce((s,t)=>s+(t.youtube-(artist.tracks.find(x=>x.id===t.id)?.youtube||0)),0),radio:updatedTracks.reduce((s,t)=>s+(t.radio-(artist.tracks.find(x=>x.id===t.id)?.radio||0)),0)}
    const streamingRevenue=platformDelta.spotify*.0035+platformDelta.apple*.007+platformDelta.youtube*.0012+platformDelta.radio*.0008
    // Chaque enregistrement conserve ses propres clauses : une réédition ne remplace jamais les droits de l'original.
    const trackRights=updatedTracks.map(t=>{
      const originalRelease=artist.releases.find(r=>!r.editionOf&&r.trackIds.includes(t.id))??artist.releases.find(r=>r.trackIds.includes(t.id))
      const contractId=t.masterContractId??originalRelease?.masterContractId??originalRelease?.labelContractId
      const hasMasterTerms=t.masterOwnership!==undefined||originalRelease?.masterOwnership!==undefined||contractId!==undefined
      const rightsContract=contractId?(artist.contracts??[]).find(c=>c.id===contractId):hasMasterTerms?undefined:activeContract
      const rawOwner=t.masterOwnership??originalRelease?.masterOwnership??rightsContract?.masterOwnership??'artist'
      const owner=rawOwner==='license'?'artist':rawOwner
      const masterShare=t.masterArtistShare??originalRelease?.masterArtistShare??(owner==='artist'?100:owner==='shared'?rightsContract?.artistMasterShare??50:0)
      const publishingContractId=t.publishingContractId??originalRelease?.publishingContractId??contractId
      const hasPublishingTerms=t.publishingOwnership!==undefined||originalRelease?.publishingOwnership!==undefined||publishingContractId!==undefined
      const publishingContract=publishingContractId?(artist.contracts??[]).find(c=>c.id===publishingContractId):hasPublishingTerms?undefined:activeContract
      const publishingOwner=t.publishingOwnership??originalRelease?.publishingOwnership??publishingContract?.publishingOwnership??'artist'
      const publishingShare=t.artistPublishingShare??originalRelease?.artistPublishingShare??(publishingOwner==='artist'?100:publishingOwner==='shared'?publishingContract?.artistPublishingShare??50:0)
      const oldTrack=artist.tracks.find(x=>x.id===t.id)
      const revenue=(t.spotify-(oldTrack?.spotify??0))*.0035+(t.apple-(oldTrack?.apple??0))*.007+(t.youtube-(oldTrack?.youtube??0))*.0012+(t.radio-(oldTrack?.radio??0))*.0008
      const royalty=owner==='label'?(rightsContract?.artistRoyalty??(rightsContract?100-rightsContract.royalty:0)):masterShare
      const fee=rightsContract&&(rightsContract.status??'active')==='active'&&(rightsContract.remainingWeeks??rightsContract.years*52)>0?(rightsContract.distributionFee??0):0
      const publishingGross=revenue*.16
       return {contractId:rightsContract?.id,revenue,artistMaster:revenue*(1-fee/100)*royalty/100,distribution:revenue*fee/100,publishingGross,publishing:publishingGross*publishingShare/100,labelPublishing:publishingGross*(1-publishingShare/100)}
    })
    const artistMasterRevenue=trackRights.reduce((sum,r)=>sum+r.artistMaster,0)
    const distributionIncome=trackRights.reduce((sum,r)=>sum+r.distribution,0)
    const publishingRevenue=trackRights.reduce((sum,r)=>sum+r.publishing,0)
    const publishingGross=trackRights.reduce((sum,r)=>sum+(r.publishingGross??0),0)
    const labelPublishingShare=trackRights.reduce((sum,r)=>sum+(r.labelPublishing??0),0)
    const dueSyncDeals=(artist.syncDeals??[]).filter(d=>d.status==='pending'&&d.paymentWeek===week&&d.paymentYear===year)
    const syncGross=dueSyncDeals.reduce((sum,d)=>sum+d.fee,0)
    const syncArtistMaster=dueSyncDeals.reduce((sum,d)=>sum+d.artistMasterAmount,0)
    const syncArtistPublishing=dueSyncDeals.reduce((sum,d)=>sum+d.artistPublishingAmount,0)
    const syncLabelShare=dueSyncDeals.reduce((sum,d)=>sum+d.labelMasterAmount+d.labelPublishingAmount,0)
    const merchItems=(artist.merchItems??[]).map(item=>{const sold=item.active?Math.min(Math.max(0,Math.round(artist.fans*.00016*(.7+artist.popularity/100))),Math.max(0,100000-item.sold)):0;return {...item,sold:item.sold+sold}})
    const merchUnits=merchItems.reduce((sum,item)=>sum+(item.sold-((artist.merchItems??[]).find(old=>old.id===item.id)?.sold??0)),0)
    const merchRevenue=merchItems.reduce((sum,item)=>sum+(item.sold-((artist.merchItems??[]).find(old=>old.id===item.id)?.sold??0))*item.price,0)
    const merchCosts=merchItems.reduce((sum,item)=>sum+(item.sold-((artist.merchItems??[]).find(old=>old.id===item.id)?.sold??0))*item.cost,0)
    const showsThisWeek=artist.tour.filter(s=>s.week===week&&s.year===year)
    const tourRevenue=showsThisWeek.reduce((s,x)=>s+x.revenue,0)
    const tourCosts=showsThisWeek.reduce((s,x)=>s+(x.productionCost??0),0)
    const tourProfit=tourRevenue-tourCosts
    const merchCut=activeContract?(activeContract.merchShare??activeContract.threeSixtyShare??0):0
    const liveCut=activeContract?(activeContract.liveShare??activeContract.threeSixtyShare??0):0
    const artistNonStreamingShare=activeContract
      ? (merchRevenue-merchCosts)*(1-merchCut/100)+tourProfit-Math.max(0,tourProfit)*liveCut/100
      : (merchRevenue-merchCosts)+tourProfit
    const artistGrossShare=artistMasterRevenue+artistNonStreamingShare
    // Une avance ne se rembourse qu'avec la part artiste générée par les enregistrements rattachés à ce contrat.
    const eligibleByContract=trackRights.reduce<Record<string,number>>((totals,r)=>{if(r.contractId)totals[r.contractId]=(totals[r.contractId]??0)+r.artistMaster;return totals},{})
    for(const deal of dueSyncDeals)if(deal.contractId)eligibleByContract[deal.contractId]=(eligibleByContract[deal.contractId]??0)+deal.artistMasterAmount
    const recoupedByContract=Object.fromEntries(Object.entries(eligibleByContract).map(([contractId,eligible])=>{
      const contract=(artist.contracts??[]).find(c=>c.id===contractId)
      return [contractId,Math.min(contract?.recoupableBalance??0,eligible)]
    })) as Record<string,number>
    const recouped=Object.values(recoupedByContract).reduce((sum,value)=>sum+value,0)
    const marketingSpend=(artist.campaigns??[]).filter(c=>c.remainingWeeks>0).reduce((sum,c)=>sum+Math.min(c.weeklyCost??0,Math.max(0,(c.budget??0)-(c.spent??0))),0)
    const artistTotalShare=artistGrossShare+publishingRevenue+syncArtistMaster+syncArtistPublishing
    const cashNet=artistTotalShare-recouped
    const managementFee=artist.managerContract&&artist.managerContract.remainingWeeks>0?Math.round(Math.max(0,cashNet)*artist.managerContract.commission/100):0
    const net=cashNet-marketingSpend-managementFee
    const labelStreamingShare=Math.max(0,streamingRevenue-distributionIncome-artistMasterRevenue)
    const labelMerchShare=activeContract?(merchRevenue-merchCosts)*merchCut/100:0
    const labelLiveShare=activeContract?Math.max(0,tourProfit)*liveCut/100:0
    const financeWeek:FinanceWeek={week,year,spotifyStreams:platformDelta.spotify,appleStreams:platformDelta.apple,youtubeStreams:platformDelta.youtube,radioPlays:platformDelta.radio,spotifyRevenue:platformDelta.spotify*.0035,appleRevenue:platformDelta.apple*.007,youtubeRevenue:platformDelta.youtube*.0012,radioRevenue:platformDelta.radio*.0008,streamingGross:streamingRevenue,publishingRevenue,merchGross:merchRevenue,merchCosts,tourGross:tourRevenue,tourCosts,artistShare:artistTotalShare,labelShare:labelStreamingShare+labelPublishingShare+syncLabelShare+labelMerchShare+labelLiveShare,publishingGross,labelPublishingShare,syncGross,syncArtistShare:syncArtistMaster+syncArtistPublishing,syncLabelShare,labelMerchShare,labelLiveShare,artistMerchShare:(merchRevenue-merchCosts)-labelMerchShare,artistLiveShare:tourProfit-labelLiveShare,distributionFee:distributionIncome,marketingSpend,managementFee,recouped,net,contractRecoupments:contracts.filter(c=>(recoupedByContract[c.id]??0)>0).map(c=>({contractId:c.id,label:c.label,amount:recoupedByContract[c.id]??0,balanceAfter:Math.max(0,(c.recoupableBalance??0)-(recoupedByContract[c.id]??0))}))}
    const settledContracts=contracts.map(c=>{const paid=recoupedByContract[c.id]??0;const balance=Math.max(0,(c.recoupableBalance??0)-paid);return {...c,recoupableBalance:balance,recoupedTotal:(c.recoupedTotal??0)+paid,recoupableTotal:c.recoupableTotal??((c.recoupableBalance??0)+(c.recoupedTotal??0))}})
    const ownLabelArtists=(artist.ownLabelArtists??[]).map((a,i)=>{const streams=a.remainingWeeks>0?Math.round((a.fans*.42+a.popularity*160)*(.8+Math.abs(Math.sin((week+year+i*7)*5.4))*.4)):0;const gross=streams*.0035;const artistShare=gross*a.artistRoyalty/100;const recouped=Math.min(a.recoupableBalance??a.advance,artistShare);const artistPaid=artistShare-recouped;const revenue=gross-artistPaid;return {...a,remainingWeeks:Math.max(0,a.remainingWeeks-1),streams:a.streams+streams,revenue:a.revenue+revenue,recoupableBalance:Math.max(0,(a.recoupableBalance??a.advance)-recouped),artistEarnings:(a.artistEarnings??0)+artistPaid,weeklyStreams:streams,weeklyRevenue:revenue,weeklyArtistEarnings:artistPaid}})
    const ownLabelIncome=ownLabelArtists.reduce((sum,a)=>sum+((a as typeof a & {weeklyRevenue?:number}).weeklyRevenue??0),0)
    const newFans=Math.round(Math.max(8,artist.fans*(.004+artist.popularity/10000)+(weeklyStreams/120000))*(1+(artist.managerContract&&artist.managerContract.remainingWeeks>0?artist.managerContract.fanBonus:0)))
    const pop=clamp(artist.popularity+(weeklyStreams>1000000?1.2:weeklyStreams>100000?.45:-.12)+(chart.some(c=>c.own&&c.rank<=10)?1.5:0)-breachPenalty,0,100)
    const weeklyPosts:FeedPost[]=[
      {id:id(),week,year,source:'Music News',text:`Bilan de la semaine : ${artist.name} cumule ${fmt(weeklyStreams)} nouvelles écoutes sur les plateformes.`},
      ...dueSyncDeals.map(d=>({id:id(),week,year,source:'Industry News',text:`Le titre « ${d.trackTitle} » décroche une synchronisation pour ${d.client} (${d.format}). Le paiement de ${money(d.fee)} est intégré à vos comptes.`})),
      ...marketStories.slice(0,3),
      ...chartPosts.slice(0,3)
    ]
    for(const c of breachedContracts)weeklyPosts.push({id:id(),week,year,source:'Industry News',text:`Le contrat de ${artist.name} avec ${c.label} arrive à échéance sans que tous les engagements de sortie aient été remplis. Cette situation fragilise sa réputation auprès des partenaires.`})
    if(chart.some(c=>c.own&&c.rank===1))weeklyPosts.unshift({id:id(),week,year,source:'Pop Crave',text:`NUMBER ONE ! ${artist.name} décroche la première place du classement mondial cette semaine.`})
    const wiki=[...artist.wiki,`Semaine ${week} de ${year} : ${fmt(weeklyStreams)} nouvelles écoutes enregistrées sur Spotify, Apple Music et YouTube.`,...updatedTracks.filter(t=>t.rank!==null).map(t=>`Semaine ${week} de ${year} : « ${t.title} » atteint la position ${t.rank} du classement mondial (meilleur classement : ${t.peak}).`)]
    const eventRoll=Math.abs(Math.sin((year*52+week)*12.9898))
    const eventIndex=Math.floor(Math.abs(Math.sin((year*52+week)*78.233))*10)
    const eventTemplates:Omit<CareerEvent,'id'>[]=[
      {category:'BUZZ & RÉSEAUX',title:'La vidéo qui échappe à votre contrôle',description:'Un extrait spontané en coulisses commence à circuler. Les fans adorent votre naturel, mais les commentaires partent dans tous les sens.',choices:[{id:'ride',label:'Jouer le jeu',detail:'Rebondir avec humour et laisser le buzz vivre.',money:0,fans:Math.round(artist.fans*.035+180),popularity:1.2,energy:-4,streamBoost:1.12,boostWeeks:2,result:'Le public s’attache à votre spontanéité. La vidéo continue de circuler.'},{id:'polish',label:'Reprendre la main',detail:'Investir dans une vidéo officielle pour transformer l’essai.',money:-Math.min(12000,Math.max(2500,Math.round(artist.fans*.8))),fans:Math.round(artist.fans*.018+80),popularity:.5,energy:-2,result:'Le buzz devient une vraie opération de communication, mais le naturel du premier extrait s’estompe.'}]},
      {category:'STUDIO & COLLABORATIONS',title:'Un producteur veut travailler avec vous',description:'Un producteur indépendant vous contacte après avoir découvert votre dernier projet. Il propose une session cette semaine, sans garantie de résultat.',choices:[{id:'session',label:'Financer une session',detail:'Dépenser pour tenter de créer un morceau marquant.',money:-Math.min(18000,Math.max(4500,Math.round(artist.money*.035))),fans:Math.round(artist.fans*.012+45),popularity:1.1,energy:-12,streamBoost:1.22,boostWeeks:3,result:'La session vous ouvre de nouvelles pistes créatives. Une rencontre qui pourrait compter pour la suite.'},{id:'meet',label:'Proposer un premier rendez-vous',detail:'Prendre le temps de voir si vos univers se complètent.',money:0,fans:Math.round(artist.fans*.004+20),popularity:.25,energy:-3,result:'Vous faites connaissance sans engager de budget. La collaboration reste à construire.'}]},
      {category:'MÉDIAS & IMAGE',title:'Une invitation en direct',description:'Une émission musicale vous propose une performance acoustique. C’est une belle vitrine, mais il faut préparer un arrangement et mobiliser votre équipe.',choices:[{id:'live',label:'Accepter le direct',detail:'Miser sur une performance mémorable.',money:-Math.min(9000,Math.max(1800,Math.round(artist.fans*.35))),fans:Math.round(artist.fans*.025+120),popularity:1.35,energy:-10,streamBoost:1.16,boostWeeks:2,result:'Votre prestation touche un nouveau public. Les extraits du direct commencent à être partagés.'},{id:'decline',label:'Décliner poliment',detail:'Préserver votre énergie et attendre une meilleure occasion.',money:0,fans:0,popularity:0,energy:5,result:'Vous gardez du temps pour votre prochain projet. L’émission passera à un autre invité.'}]},
      {category:'COMMUNAUTÉ',title:'Vos fans lancent un mouvement',description:'Une communauté de fans organise spontanément une journée d’écoute autour de votre musique. Elle vous demande simplement un signe de soutien.',choices:[{id:'support',label:'Leur donner de la visibilité',detail:'Partager leur initiative et enregistrer un message personnalisé.',money:0,fans:Math.round(artist.fans*.045+220),popularity:1,energy:-3,result:'Les fans se sentent considérés et mobilisent encore plus largement leur communauté.'},{id:'event',label:'Organiser un événement surprise',detail:'Préparer un petit rendez-vous en ligne avec votre équipe.',money:-Math.min(7000,Math.max(1500,Math.round(artist.fans*.22))),fans:Math.round(artist.fans*.06+300),popularity:1.5,energy:-8,streamBoost:1.18,boostWeeks:2,result:'Le rendez-vous devient un moment fort entre vous et votre public.'}]},
      {category:'INDUSTRIE MUSICALE',title:'Une opportunité qui ne se représentera pas forcément',description:'Un programmateur vous propose une première partie sur quelques dates d’une tournée bien installée. La rémunération est modeste, mais l’exposition peut être précieuse.',choices:[{id:'tour',label:'Saisir l’occasion',detail:'Investir dans le déplacement et jouer devant un nouveau public.',money:-Math.min(15000,Math.max(3000,Math.round(artist.fans*.5))),fans:Math.round(artist.fans*.055+260),popularity:1.7,energy:-14,streamBoost:1.2,boostWeeks:3,result:'Vous gagnez en visibilité et découvrez un public qui ne vous connaissait pas encore.'},{id:'focus',label:'Rester concentré sur votre projet',detail:'Refuser pour protéger votre calendrier et votre budget.',money:0,fans:0,popularity:0,energy:4,result:'Vous gardez vos ressources pour votre propre calendrier de sorties.'}]},
      {category:'COLLABORATION',title:'Un artiste vous propose un featuring',description:'Un autre artiste en pleine ascension vous propose de partager un morceau. Vos publics pourraient se rencontrer, mais il faut trouver le bon titre et le bon moment.',choices:[{id:'feature',label:'Dire oui et lancer la session',detail:'Investir du temps pour toucher deux communautés.',money:-Math.min(11000,Math.max(2500,Math.round(artist.fans*.28))),fans:Math.round(artist.fans*.025+140),popularity:1.2,energy:-13,streamBoost:1.2,boostWeeks:3,result:'La collaboration crée une nouvelle dynamique et vos deux publics commencent à se croiser.'},{id:'later',label:'Proposer de reporter',detail:'Garder le contact sans précipiter le projet.',money:0,fans:0,popularity:.15,energy:0,result:'Vous restez en bons termes et gardez la possibilité de collaborer plus tard.'}]},
      {category:'STUDIO & CRÉATION',title:'Votre ancien titre mérite une seconde vie',description:'Un DJ et producteur vous propose un remix de l’un de vos morceaux. Il pense pouvoir lui donner une nouvelle exposition en club et sur les réseaux.',choices:[{id:'remix',label:'Financer le remix',detail:'Payer la production et tenter de relancer le morceau.',money:-Math.min(8000,Math.max(1800,Math.round(artist.fans*.18))),fans:Math.round(artist.fans*.018+90),popularity:.9,energy:-5,streamBoost:1.15,boostWeeks:2,result:'Le remix attire une nouvelle audience et redonne de la visibilité à votre catalogue.'},{id:'original',label:'Préserver la version originale',detail:'Ne pas disperser l’attention autour du morceau.',money:0,fans:0,popularity:0,energy:2,result:'Vous gardez le contrôle de votre direction artistique et de votre calendrier.'}]},
      {category:'PRESSE & CRITIQUE',title:'Une critique fait beaucoup parler',description:'Un article très partagé juge votre dernier projet sévèrement. Vos fans prennent votre défense, et plusieurs médias attendent votre réaction.',choices:[{id:'respond',label:'Répondre avec élégance',detail:'Publier un message posé et assumer votre démarche.',money:0,fans:Math.round(artist.fans*.012+60),popularity:.6,energy:-2,result:'Votre réponse est saluée pour son calme. Le débat retombe progressivement.'},{id:'ignore',label:'Laisser parler la musique',detail:'Ne pas alimenter la polémique et rester concentré.',money:0,fans:0,popularity:.1,energy:4,result:'Vous refusez de donner plus d’importance à la critique et poursuivez votre travail.'}]},
      {category:'RADIO & PROMOTION',title:'Une radio veut vous recevoir',description:'Une station nationale vous propose une interview et une session live. L’occasion peut donner un coup d’accélérateur à un titre qui commence à circuler.',choices:[{id:'radio',label:'Prendre l’antenne',detail:'Préparer une session et vous rendre disponible.',money:-Math.min(5000,Math.max(900,Math.round(artist.fans*.12))),fans:Math.round(artist.fans*.03+160),popularity:1.1,energy:-7,streamBoost:1.14,boostWeeks:2,result:'L’interview vous donne une belle exposition et les auditeurs découvrent votre catalogue.'},{id:'schedule',label:'Négocier une autre date',detail:'Préserver votre planning sans fermer la porte.',money:0,fans:0,popularity:0,energy:2,result:'La radio accepte de reprendre contact plus tard. Vous gardez la main sur votre agenda.'}]},
      {category:'RÉCOMPENSES',title:'Votre nom circule pour une récompense',description:'Une cérémonie indépendante vous informe que votre dernier projet figure parmi les artistes envisagés. Une présence remarquée pourrait renforcer votre crédibilité.',choices:[{id:'attend',label:'Préparer une apparition',detail:'Investir dans la tenue, le déplacement et la communication.',money:-Math.min(10000,Math.max(2200,Math.round(artist.fans*.3))),fans:Math.round(artist.fans*.022+110),popularity:1.4,energy:-6,streamBoost:1.1,boostWeeks:2,result:'Votre présence attire l’attention des médias et installe votre nom dans la conversation.'},{id:'lowkey',label:'Rester discret',detail:'Ne pas investir dans une cérémonie dont l’issue est incertaine.',money:0,fans:0,popularity:0,energy:3,result:'Vous préférez laisser votre musique parler et économiser vos ressources.'}]}
    ]
    const pendingEvent:CareerEvent|undefined=eventRoll>.68?{...eventTemplates[eventIndex],id:id()}:undefined
    const next={...artist,week,year,pendingEvent,careerBoosts:(artist.careerBoosts??[]).map(b=>({...b,remainingWeeks:Math.max(0,b.remainingWeeks-1)})).filter(b=>b.remainingWeeks>0),energy:Math.min(100,artist.energy+18),money:artist.money+net,fans:artist.fans+newFans,popularity:pop,tracks:updatedTracks,lastWeekStreams:weeklyStreams,spotifyFollowers:(artist.spotifyFollowers??Math.round(artist.fans*.72))+Math.round(newFans*.48),socialPosts:(artist.socialPosts??[]).map(p=>({...p,boostWeeks:Math.max(0,p.boostWeeks-1),views:p.views+Math.round(p.views*.08),likes:p.likes+Math.round(p.views*.004),comments:p.comments+Math.round(p.views*.0004)})),campaigns:(artist.campaigns??[]).map(c=>({...c,remainingWeeks:Math.max(0,c.remainingWeeks-1),spent:(c.spent??0)+(c.remainingWeeks>0?Math.min(c.weeklyCost??0,Math.max(0,(c.budget??0)-(c.spent??0))):0)})),managerContract:artist.managerContract?{...artist.managerContract,remainingWeeks:Math.max(0,artist.managerContract.remainingWeeks-1)}:undefined,manager:artist.managerContract&&artist.managerContract.remainingWeeks===1?undefined:artist.manager,contracts:settledContracts,ownLabelArtists,ownLabelCapital:(artist.ownLabelCapital??0)+ownLabelIncome,ownLabelReputation:Math.min(100,(artist.ownLabelReputation??0)+(ownLabelIncome>1000?.15:0)),label:activeContract?artist.label:(artist.ownLabelName??'Indépendant'),labelShare:streamingRevenue>0?Math.round(labelStreamingShare/streamingRevenue*100):artist.labelShare,releases,spotify:artist.spotify+platformDelta.spotify,apple:artist.apple+platformDelta.apple,youtube:artist.youtube+platformDelta.youtube,radio:artist.radio+platformDelta.radio,posts:[...weeklyPosts,...artist.posts].slice(0,80),wiki:wiki.slice(-150),chart,albumChart,marketCharts,chartHistory:chartHistory.slice(-300),merchItems,merch:artist.merch+merchUnits,merchRevenue:artist.merchRevenue+merchRevenue,syncDeals:(artist.syncDeals??[]).map(d=>dueSyncDeals.some(paid=>paid.id===d.id)?{...d,status:'paid' as const}:d),financeHistory:[...(artist.financeHistory??[]),financeWeek].slice(-104)}
    setArtist(next);setNotice(`Semaine ${week} terminée : +${fmt(weeklyStreams)} écoutes, +${fmt(newFans)} fans et ${money(net)} de revenus nets.`)
  }
  function resolveCareerEvent(choiceId:string){
    if(!artist?.pendingEvent)return
    const choice=artist.pendingEvent.choices.find(x=>x.id===choiceId)
    if(!choice||choice.money<0&&artist.money<Math.abs(choice.money))return
    const event=artist.pendingEvent
    const post:FeedPost={id:id(),week:artist.week,year:artist.year,source:'Career Update',text:event.title+' — '+choice.result}
    setArtist({...artist,pendingEvent:undefined,careerBoosts:choice.streamBoost&&choice.boostWeeks?[...(artist.careerBoosts??[]),{id:id(),label:event.title,multiplier:choice.streamBoost,remainingWeeks:choice.boostWeeks}]:artist.careerBoosts,money:artist.money+choice.money,fans:Math.max(0,artist.fans+choice.fans),popularity:clamp(artist.popularity+choice.popularity,0,100),energy:clamp(artist.energy+choice.energy,0,100),posts:[post,...artist.posts].slice(0,80),wiki:[...artist.wiki,post.text].slice(-150)})
    setNotice(choice.result)
  }
  function reset() {if(!window.confirm('Supprimer définitivement cette carrière et sa sauvegarde ?'))return;localStorage.removeItem(SAVE_KEY);localStorage.removeItem(BACKUP_KEY);localStorage.removeItem(OLD_KEY);setArtist(null);setTab('Vue d’ensemble');setNotice('')}
  const workspaces=[
    {key:'ACCUEIL',label:'Accueil',icon:Home,items:[{label:'Vue d’ensemble',short:'Vue générale'}]},
    {key:'STUDIO',label:'Studio',icon:Mic2,items:[{label:'Studio & sorties',short:'Créer'}]},
    {key:'SORTIES',label:'Sorties',icon:Disc3,items:[{label:'Ma discographie',short:'Catalogue'}]},
    {key:'CARRIÈRE',label:'Carrière',icon:Users,items:[{label:'Promotion',short:'Campagnes'},{label:'Plateformes',short:'Audience'},{label:'Médias & presse',short:'Presse'},{label:'Identité',short:'Profil'}]},
    {key:'CHARTS',label:'Charts',icon:BarChart3,items:[{label:'Classements',short:'Classements'}]},
    {key:'BUSINESS',label:'Business',icon:Wallet,items:[{label:'Finances',short:'Finances'},{label:'Synchronisations',short:'Synchros'},{label:'Tournées',short:'Live'},{label:'Labels',short:'Contrats'},{label:'Merch',short:'Boutique'}]}
  ]
  const activeWorkspace=workspaces.find(w=>w.items.some(item=>item.label===tab))??workspaces[0]
  if(!artist)return <main className="welcome-screen"><div className="welcome-glow"/><div className="welcome-content"><div className="brand-mark"><Music2 size={22}/></div><p className="eyebrow">VOTRE HISTOIRE COMMENCE ICI</p><h1>La musique.<br/><span>Votre carrière.</span></h1><p className="welcome-copy">Créez votre artiste, choisissez votre point de départ et prenez les commandes de votre ascension dans l’industrie musicale.</p><form className="creation-card" onSubmit={createCareer}><div className="card-heading"><Sparkles size={18}/><span>Créer une nouvelle carrière</span></div><label>Nom d’artiste<input name="name" placeholder="Ex. : Nova" maxLength={32} required/></label><div className="form-row"><label>Genre musical<select name="genre">{genres.map(g=><option key={g}>{g}</option>)}</select></label><label>Pays<select name="country">{['France','États-Unis','Royaume-Uni','Canada','Belgique','Corée du Sud','Autre'].map(x=><option key={x}>{x}</option>)}</select></label></div><label>Âge (facultatif)<input name="age" type="number" min="13" max="100" placeholder="Ex. : 24"/></label><label>Photo / portrait (URL facultative)<input name="image" type="url" placeholder="https://…"/></label><div className="start-options"><p className="eyebrow">CHOISISSEZ VOTRE POINT DE DÉPART — TRICHE AUTORISÉE</p><label>Argent de départ <strong id="money-value">250 000 €</strong><input name="money" type="range" min="0" max="100000000" step="50000" defaultValue="250000" onInput={e=>{const el=document.getElementById('money-value');if(el)el.textContent=money(Number(e.currentTarget.value))}}/></label><label>Fans au départ <strong id="fans-value">1 200</strong><input name="fans" type="range" min="0" max="100000000" step="100" defaultValue="1200" onInput={e=>{const el=document.getElementById('fans-value');if(el)el.textContent=fmt(Number(e.currentTarget.value))}}/></label><label>Popularité <strong id="pop-value">8 / 100</strong><input name="popularity" type="range" min="0" max="100" defaultValue="8" onInput={e=>{const el=document.getElementById('pop-value');if(el)el.textContent=e.currentTarget.value+' / 100'}}/></label></div><button className="primary-button" type="submit">Lancer ma carrière <ChevronRight size={18}/></button><p className="form-footnote">Sauvegarde automatique sur cet appareil · Vous pourrez ajuster les règles plus tard.</p></form><div className="welcome-footer"><span>UNIVERS MUSICAL SIMULÉ</span><span>VERSION 1.2.0</span></div></div></main>

  const recent=artist.posts.slice(0,8)
  const latestRelease=artist.releases[artist.releases.length-1]
  const total=artist.spotify+artist.apple+artist.youtube
  return <div className="app-shell">
  <header className="new-app-header">
    <div className="new-header-top">
      <button className="new-brand" onClick={()=>setTab('Vue d’ensemble')} aria-label="Retour à l’accueil"><span className="new-brand-mark"><Music2 size={21}/></span><span>STAGE<span className="brand-dot">.</span></span></button>
      <button className="new-artist-chip" onClick={()=>setTab('Identité')}>{artist.image?<img src={artist.image} alt=""/>:<span className="new-artist-avatar">{artist.name.slice(0,1).toUpperCase()}</span>}<span><b>{artist.name}</b><small>{artist.genre} · {artist.country}</small></span><ChevronRight size={15}/></button>
      <div className="new-header-spacer"/>
      <span className="new-season">{dateLabel}</span>
      <button className="next-week new-next-week" onClick={nextWeek} disabled={!!artist.pendingEvent}><Play size={14} fill="currentColor"/> {artist.pendingEvent?'Répondre':'Semaine suivante'}</button>
      <details className="new-settings"><summary aria-label="Options"><Settings2 size={18}/></summary><div className="new-settings-menu"><button onClick={restoreBackup}><RotateCcw size={15}/> Restaurer la sauvegarde</button><button onClick={reset}><Settings2 size={15}/> Nouvelle partie</button></div></details>
    </div>
    <nav className="stage-navigation" aria-label="Navigation principale">
      <div className="stage-primary-nav">
        {workspaces.map(item=><button key={item.key} className={activeWorkspace.key===item.key?'stage-primary-link active':'stage-primary-link'} onClick={()=>setTab(item.items[0].label)}><item.icon size={17}/><span>{item.label}</span></button>)}
      </div>
      <div className="stage-context-nav" aria-label={activeWorkspace.label}>
        <span className="stage-context-label">{activeWorkspace.label.toUpperCase()} <i>/</i> ESPACE DE TRAVAIL</span>
        {activeWorkspace.items.map(item=><button key={item.label} className={tab===item.label?'stage-context-link active':'stage-context-link'} onClick={()=>setTab(item.label)}>{item.short}</button>)}
      </div>
    </nav>
  </header><main className="main-area"><div className="page-content">{artist.pendingEvent&&<div className="career-event-backdrop" role="dialog" aria-modal="true" aria-labelledby="career-event-title"><section className="career-event-card"><div className="career-event-top"><span className="career-event-spark"><Sparkles size={19}/></span><span className="eyebrow">{artist.pendingEvent.category} · SEMAINE {artist.week}</span><span className="career-event-new">NOUVEL ÉVÉNEMENT</span></div><h2 id="career-event-title">{artist.pendingEvent.title}</h2><p className="career-event-description">{artist.pendingEvent.description}</p><div className="career-event-choices">{artist.pendingEvent.choices.map(choice=><button className="career-event-choice" key={choice.id} disabled={choice.money<0&&artist.money<Math.abs(choice.money)} onClick={()=>resolveCareerEvent(choice.id)}><span><b>{choice.label}</b><small>{choice.detail}</small></span><span className="career-event-impact">{choice.money!==0?(choice.money>0?'+':'')+money(choice.money):'Sans coût'}<small>{choice.fans>0?'+'+fmt(choice.fans)+' fans': 'Pas de gain de fans'} · {choice.popularity>0?'+'+choice.popularity.toFixed(1)+' popularité':choice.popularity<0?choice.popularity.toFixed(1)+' popularité':'popularité stable'} · {choice.energy>0?'+'+choice.energy+' énergie':choice.energy<0?choice.energy+' énergie':'énergie stable'}{choice.streamBoost&&choice.boostWeeks?' · ×'+choice.streamBoost.toFixed(2)+' streams pendant '+choice.boostWeeks+' sem.':''}</small>{choice.money<0&&artist.money<Math.abs(choice.money)&&<small className="career-event-unaffordable">Trésorerie insuffisante</small>}</span><ChevronRight size={17}/></button>)}</div><p className="career-event-footnote">Votre décision aura un effet immédiat sur votre carrière. Vous pourrez reprendre le temps ensuite.</p></section></div>}{notice&&<button className="notice" onClick={()=>setNotice('')}><Sparkles size={15}/>{notice}<span>×</span></button>}
  {tab==='Applications'&&<Ecosystem artist={artist} update={patch=>setArtist(current=>current?{...current,...patch}:current)} notify={setNotice}/> }
  {tab==='Labels'?<LabelStudio artist={artist} update={patch=>setArtist(current=>current?{...current,...patch}:current)} notify={setNotice}/>:tab==='Ma discographie'?<Discography artist={artist} update={patch=>setArtist(current=>current?{...current,...patch}:current)}/>:tab==='Synchronisations'?<SyncLicensing artist={artist} update={patch=>setArtist(current=>current?{...current,...patch}:current)} notify={setNotice}/>:<CareerModules tab={tab} artist={artist} update={patch=>setArtist(current=>current?{...current,...patch}:current)} notify={setNotice}/>}
  {tab==='Finances'&&<><PageHeading eyebrow="BUSINESS & COMPTABILITÉ" title="Finances" subtitle="Un relevé hebdomadaire des revenus, des parts du label et du remboursement de vos avances. Les données commencent à être archivées à partir de la prochaine semaine simulée."/><section className="stats-grid"><Stat icon={Wallet} label="Trésorerie actuelle" value={money(artist.money)} note="Solde disponible"/><Stat icon={Activity} label="Revenus nets archivés" value={money((artist.financeHistory??[]).reduce((sum,x)=>sum+x.net,0))} note="Historique conservé · 104 semaines max."/><Stat icon={Building2} label="Part du label archivée" value={money((artist.financeHistory??[]).reduce((sum,x)=>sum+x.labelShare,0))} note="Masters, édition, synchros, merch et concerts"/><Stat icon={RotateCcw} label="Avances remboursées" value={money((artist.financeHistory??[]).reduce((sum,x)=>sum+x.recouped,0))} note="Prélevées sur votre part artiste"/></section><section className="panel"><div className="panel-top"><div><p className="eyebrow">DERNIÈRE SEMAINE ENREGISTRÉE</p><h2>{artist.financeHistory?.length?('Semaine '+artist.financeHistory[artist.financeHistory.length-1].week+' · '+artist.financeHistory[artist.financeHistory.length-1].year):'Aucun relevé pour le moment'}</h2></div><Wallet className="muted-icon"/></div>{artist.financeHistory?.length?(()=>{const x=artist.financeHistory[artist.financeHistory.length-1];return <div className="finance-breakdown"><div className="stats-grid"><Stat icon={Headphones} label="Revenus streaming bruts" value={money(x.streamingGross)} note={fmt(x.spotifyStreams+x.appleStreams+x.youtubeStreams)+' écoutes · '+fmt(x.radioPlays)+' diffusions radio'}/><Stat icon={Music2} label="Droits d’édition · artiste" value={money(x.publishingRevenue)} note={money(x.publishingGross??x.publishingRevenue)+' de droits générés au total'}/><Stat icon={Shirt} label="Merchandising" value={money(x.merchGross-x.merchCosts)} note={money(x.merchGross)+' de ventes · '+money(x.merchCosts)+' de coûts'}/><Stat icon={Ticket} label="Concerts nets" value={money(x.tourGross-(x.tourCosts??0))} note={money(x.tourGross)+' brut · '+money(x.tourCosts??0)+' de production'}/></div><div className="finance-summary"><div><span>Votre part avant recoupement</span><strong>{money(x.artistShare)}</strong></div><div><span>Part du label</span><strong>{money(x.labelShare)}</strong></div><div><span>Dont droits d’édition</span><strong>{money(x.labelPublishingShare??0)}</strong></div><div><span>Synchronisations · brut</span><strong>{money(x.syncGross??0)}</strong></div><div><span>Synchronisations · part artiste</span><strong>{money(x.syncArtistShare??0)}</strong></div><div><span>Synchronisations · part label</span><strong>{money(x.syncLabelShare??0)}</strong></div><div><span>Dont commission merchandising</span><strong>{money(x.labelMerchShare??0)}</strong></div><div><span>Dont commission concerts</span><strong>{money(x.labelLiveShare??0)}</strong></div><div><span>Votre marge merchandising</span><strong>{money(x.artistMerchShare??(x.merchGross-x.merchCosts))}</strong></div><div><span>Votre part des concerts</span><strong>{money(x.artistLiveShare??(x.tourGross-(x.tourCosts??0)))}</strong></div><div><span>Frais de distribution</span><strong>{money(x.distributionFee)}</strong></div><div><span>Coûts de production live</span><strong>− {money(x.tourCosts??0)}</strong></div><div><span>Campagnes marketing</span><strong>− {money(x.marketingSpend??0)}</strong></div><div><span>Commission du manager</span><strong>− {money(x.managementFee??0)}</strong></div><div><span>Avance recoupée</span><strong>− {money(x.recouped)}</strong></div><div className="finance-net"><span>Versement net de la semaine</span><strong>{money(x.net)}</strong></div></div><div className="stream-bars">{[{name:'Spotify',value:x.spotifyRevenue},{name:'Apple Music',value:x.appleRevenue},{name:'YouTube',value:x.youtubeRevenue},{name:'Radio',value:x.radioRevenue}].map(p=><div className="stream-row" key={p.name}><span>{p.name}</span><div><i style={{width:`${x.streamingGross?Math.max(0,p.value/x.streamingGross*100):0}%`}}/></div><b>{money(p.value)}</b></div>)}</div>{x.contractRecoupments?.length?<div className="contract-week-recovery"><div className="contract-week-recovery-title"><b>Recoupement par contrat cette semaine</b><small>Prélevé uniquement sur les revenus de masters concernés</small></div>{x.contractRecoupments.map(item=><div className="contract-week-recovery-row" key={item.contractId}><span><b>{item.label}</b><small>Solde après prélèvement : {money(item.balanceAfter)}</small></span><strong>− {money(item.amount)}</strong></div>)}</div>:null}</div>})():<p className="empty-state">Terminez une semaine de carrière pour générer votre premier relevé financier. Vos anciennes semaines ne sont pas recalculées rétroactivement.</p>}</section><section className="panel contract-recovery-panel"><div className="panel-top"><div><p className="eyebrow">SUIVI DES AVANCES</p><h2>Recoupement par contrat</h2></div><span className="count-pill">{(artist.contracts??[]).length} contrat(s)</span></div>{(artist.contracts??[]).length?<div className="contract-recovery-list">{(artist.contracts??[]).slice().reverse().map(c=>{const balance=Math.max(0,c.recoupableBalance??0);const paid=Math.max(0,c.recoupedTotal??0);const total=Math.max(balance+paid,c.recoupableTotal??0);const progress=total>0?Math.min(100,paid/total*100):100;return <article className="contract-recovery-row" key={c.id}><div className="contract-recovery-head"><div><strong>{c.label}</strong><small>{c.dealType??'Contrat musical'} · {(c.status??'active')==='active'?'Actif':c.status==='terminated'?'Résilié':'Échu'}</small></div><b>{money(balance)} <small>restant</small></b></div><div className="contract-recovery-progress"><i><b style={{width:progress+'%'}}/></i><span>{progress.toFixed(0)} % remboursé</span></div><div className="contract-recovery-values"><span>Dette initiale suivie <b>{money(total)}</b></span><span>Déjà recoupé <b>{money(paid)}</b></span><span>Solde restant <b>{money(balance)}</b></span></div></article>})}</div>:<p className="empty-state">Aucun contrat signé. Les avances et budgets recoupables apparaîtront ici après une signature.</p>}<p className="panel-description">Le recoupement est suivi séparément pour chaque contrat et uniquement sur les revenus de masters attribués à ce contrat. Les droits d’édition, le merchandising et les concerts ne remboursent pas cette dette dans le modèle actuel.</p></section><section className="panel"><div className="panel-top"><div><p className="eyebrow">JOURNAL COMPTABLE</p><h2>Historique des 104 dernières semaines</h2></div><span className="count-pill">{artist.financeHistory?.length??0} relevés</span></div>{artist.financeHistory?.length?<div className="billboard-table-wrap"><table className="billboard-table"><thead><tr><th>Période</th><th>Streaming brut</th><th>Édition artiste</th><th>Édition label</th><th>Synchro artiste</th><th>Synchro label</th><th>Merch net</th><th>Concerts nets</th><th>Label total</th><th>Dont merch</th><th>Dont live</th><th>Recoupé</th><th>Net artiste</th></tr></thead><tbody>{[...(artist.financeHistory??[])].reverse().map((x,i)=><tr key={x.year+'-'+x.week+'-'+i}><td>S{x.week} · {x.year}</td><td>{money(x.streamingGross)}</td><td>{money(x.publishingRevenue)}</td><td>{money(x.labelPublishingShare??0)}</td><td>{money(x.syncArtistShare??0)}</td><td>{money(x.syncLabelShare??0)}</td><td>{money(x.merchGross-x.merchCosts)}</td><td>{money(x.tourGross-(x.tourCosts??0))}</td><td>{money(x.labelShare)}</td><td>{money(x.labelMerchShare??0)}</td><td>{money(x.labelLiveShare??0)}</td><td>{money(x.recouped)}</td><td><strong>{money(x.net)}</strong></td></tr>)}</tbody></table></div>:<p className="empty-state">Le journal se remplira automatiquement à la fin de chaque semaine.</p>}</section><p className="panel-description">Modèle économique fictif : les taux par plateforme et la part éditoriale estimée (16 % des revenus d’enregistrement) sont des hypothèses de simulation. Les droits d’édition sont ventilés entre l’artiste et l’éditeur selon la propriété déclarée. Les avances ne sont pas des revenus supplémentaires lorsqu’elles sont versées : elles sont récupérées progressivement sur les seules recettes de masters prévues au contrat.</p></>}
  {tab==='Vue d’ensemble'&&<div className="dashboard-v3">
    <section className="dashboard-hero">
      <div className="dashboard-hero-copy">
        <div className="dashboard-kicker"><span className="hero-live-dot"/> VOTRE CARRIÈRE <i/> {dateLabel.toUpperCase()}</div>
        <p className="hero-greeting">C’EST VOTRE HISTOIRE</p>
        <h1>{artist.name}<span className="hero-period">.</span></h1>
        <p className="hero-description">{artist.genre} · {artist.country} <span>—</span> {artist.popularity>=75?'Une présence qui domine la scène.':artist.popularity>=35?'Votre nom commence à compter dans l’industrie.':'Chaque sortie est une occasion de vous faire remarquer.'}</p>
        <div className="hero-actions">
          <button className="hero-primary-action" onClick={()=>setTab('Studio & sorties')}><Mic2 size={16}/> Créer une chanson <ChevronRight size={16}/></button>
          <button className="hero-secondary-action" onClick={()=>setTab('Classements')}>Voir les classements <ArrowUpRight size={15}/></button>
        </div>
      </div>
      <div className="dashboard-hero-art" aria-hidden="true">
        {artist.image?<img src={artist.image} alt=""/>:<div className="hero-monogram">{artist.name.slice(0,1).toUpperCase()}</div>}
        <div className="hero-vinyl"><span/><i/></div>
        <div className="hero-status-card"><small>STATUT DE CARRIÈRE</small><b>{artist.popularity>=75?'Star internationale':artist.popularity>=35?'Artiste confirmé':'Début de carrière'}</b><span><Star size={12} fill="currentColor"/> {artist.popularity.toFixed(1)} / 100</span></div>
      </div>
      <div className="hero-index">MCS <b>/{String(artist.week).padStart(2,'0')}</b></div>
    </section>

    <section className="dashboard-metrics" aria-label="Indicateurs de carrière">
      <article className="metric-card metric-cash"><div className="metric-label"><Wallet size={15}/> TRÉSORERIE <span>01</span></div><strong>{money(artist.money)}</strong><small>Capital disponible</small><div className="metric-accent-line"/></article>
      <article className="metric-card"><div className="metric-label"><Users size={15}/> COMMUNAUTÉ <span>02</span></div><strong>{fmt(artist.fans)}</strong><small>Fans dans le monde</small><div className="metric-mini-bars"><i/><i/><i/><i/><i/><i/><i/></div></article>
      <article className="metric-card"><div className="metric-label"><Star size={15}/> POPULARITÉ <span>03</span></div><strong>{artist.popularity.toFixed(1)}<em>/100</em></strong><small>Votre popularité</small><div className="metric-progress"><i style={{width:artist.popularity+'%'}}/></div></article>
      <article className="metric-card"><div className="metric-label"><Activity size={15}/> ÉCOUTES AU TOTAL <span>04</span></div><strong>{fmt(total)}</strong><small>Sur toutes les plateformes</small><div className="metric-accent-line"/></article>
    </section>

    {(artist.careerBoosts??[]).length>0&&<section className="career-momentum-strip"><div><Sparkles size={18}/><b>Votre carrière prend de l’élan</b></div>{artist.careerBoosts?.map(boost=><span key={boost.id}><strong>{boost.label}</strong><small>×{boost.multiplier.toFixed(2)} sur les streams · encore {boost.remainingWeeks} semaine(s)</small></span>)}</section>}

    <section className="dashboard-platform-ribbon">
      <div className="ribbon-heading"><span>VOS ÉCOUTES</span><b>PAR PLATEFORME</b></div>
      {platforms.map((p,i)=><div className="ribbon-platform" key={p.key}><span className={'platform-logo '+p.cls}>{p.key==='spotify'?'●':p.key==='apple'?'♪':p.key==='youtube'?'▶':'◉'}</span><div><small>{p.name.toUpperCase()}</small><strong>{fmt(artist[p.key])}</strong></div><i>{String(i+1).padStart(2,'0')}</i></div>)}
      <button onClick={()=>setTab('Plateformes')}>Voir le détail <ArrowUpRight size={14}/></button>
    </section>

    <section className="dashboard-workspace">
      <div className="dashboard-main-column">
        <article className="dashboard-feature-panel">
          <div className="feature-panel-top"><div><span className="section-index">VOTRE MUSIQUE</span><h2>{artist.releases.length?'Votre prochain mouvement':'Tout commence par un premier titre.'}</h2></div><span className="feature-record-icon"><Disc3 size={24}/></span></div>
          {artist.releases.length?<div className="featured-release-row"><div className="featured-release-art">{latestRelease?.coverArt?<img src={latestRelease.coverArt} alt="Pochette de l’album"/>:<Disc3 size={34}/>}</div><div className="featured-release-copy"><small>DERNIÈRE SORTIE · {latestRelease?.type.toUpperCase()} · {latestRelease?.year}</small><h3>{latestRelease?.title}</h3><p>{latestRelease?.trackIds.length??0} titre(s) · {latestRelease?.currentRank?'#'+latestRelease.currentRank+' dans les charts':'Pas encore classé'}</p><button className="feature-inline-link" onClick={()=>setTab('Ma discographie')}>Voir mes albums <ChevronRight size={15}/></button></div></div>:<div className="release-empty-state"><div className="empty-record"><Disc3 size={30}/></div><div><b>Votre catalogue est encore vierge.</b><p>Créez votre premier single, construisez votre identité sonore et commencez à exister sur le marché.</p><button className="feature-inline-link" onClick={()=>setTab('Studio & sorties')}>Créer ma première chanson <ChevronRight size={15}/></button></div></div>}
        </article>
        <article className="dashboard-activity-panel">
          <div className="section-heading-row"><div><span className="section-index">LES DERNIÈRES NOUVELLES</span><h2>Dans l’actualité</h2></div><span className="activity-count">{recent.length} ACTUALITÉS RÉCENTES</span></div>
          {recent.slice(0,5).map((p,i)=><div className="dashboard-news-row" key={p.id}><span className="news-number">{String(i+1).padStart(2,'0')}</span><div><small>{p.source} <i/> S{p.week} · {p.year}</small><p>{p.text}</p></div><ChevronRight size={15}/></div>)}
          {!recent.length&&<div className="dashboard-empty-note">Votre fil d’actualité se remplira au fil des décisions et des sorties.</div>}
        </article>
      </div>
      <aside className="dashboard-side-column">
        <article className="dashboard-label-card"><div className="section-heading-row"><div><span className="section-index">VOTRE LABEL</span><h2>Votre structure</h2></div><Building2 size={20}/></div><div className="label-card-monogram"><Building2 size={25}/></div><small>LABEL</small><h3>{artist.label}</h3><p>{artist.label==='Indépendant'?'Vous avancez sans maison de disques. Vous gardez le contrôle de vos masters et de vos décisions.':'Votre contrat encadre la distribution et le partage des revenus.'}</p><div className="label-card-facts"><span><small>PART DU LABEL</small><b>{artist.labelShare}%</b></span><span><small>PROJETS</small><b>{artist.releases.length}</b></span></div><button onClick={()=>setTab('Labels')}>Voir mon label <ArrowUpRight size={15}/></button></article>
        <article className="dashboard-quicklinks"><span className="section-index">POUR ALLER PLUS LOIN</span><h2>Accès rapide</h2><button onClick={()=>setTab('Finances')}><span><Wallet size={16}/></span><b>Mes finances</b><ChevronRight size={15}/></button><button onClick={()=>setTab('Tournées')}><span><Ticket size={16}/></span><b>Préparer une tournée</b><ChevronRight size={15}/></button><button onClick={()=>setTab('Promotion')}><span><TrendingUp size={16}/></span><b>Faire connaître ma musique</b><ChevronRight size={15}/></button><button onClick={()=>setTab('Médias & presse')}><span><Newspaper size={16}/></span><b>Voir la presse</b><ChevronRight size={15}/></button></article>
      </aside>
    </section>
  </div>}
  </div></main></div>
}
function Stat({icon:Icon,label,value,note}:{icon:typeof Wallet;label:string;value:string;note:string}){return <div className="stat-card"><div className="stat-top"><span>{label}</span><div className="stat-icon"><Icon size={17}/></div></div><strong>{value}</strong><small>{note}</small></div>}
function PageHeading({eyebrow,title,subtitle}:{eyebrow:string;title:string;subtitle:string}){return <section className="page-intro simple"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{subtitle}</p></div></section>}
export default App
