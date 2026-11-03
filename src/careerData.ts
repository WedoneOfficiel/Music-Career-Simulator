import type { Artist } from './App'

export type MarketCode = 'US' | 'UK' | 'FR'
export type ChartKind = 'artists' | 'albums' | 'songs'
export type MarketChartEntry = {
  id: string
  name: string
  artist: string
  streams: number
  rank: number
  lastWeek: number | null
  peak: number
  weeks: number
  isNew: boolean
  reentry: boolean
  own: boolean
}
export type MarketChartBoard = Record<ChartKind, MarketChartEntry[]>
export type MarketCharts = Record<MarketCode, MarketChartBoard>

const markets: {code:MarketCode;factor:number;ownFactor:number;names:string[]}[] = [
  {code:'US',factor:1.18,ownFactor:1.12,names:['Neon Hearts','Golden Hour','Afterglow','Satellite','Wildflower','Blue','Midnight City','Heartbeat','Pink Noise','Summer Again']},
  {code:'UK',factor:.91,ownFactor:1.04,names:['London Calling','Velvet Sky','After Hours','Electric Love','Blue Monday','Silver Lining','Paper Planes','Northern Lights','Fever Dream','Sweet Nothing']},
  {code:'FR',factor:.76,ownFactor:1.08,names:['Les heures bleues','À contre-jour','Comme avant','La nuit entière','Cœur électrique','Tout recommence','Les étoiles','Dernier été','Paradis','Minuit']},
]
const rivalArtists=['Luna Vale','The Velvet Hours','Milo June','Nova Grey','Éloïse','Jade Rivers','Sienna Rose','Atlas Bloom','Maya Sol','Noah West','Iris Monroe','The Satellites','Ariane Blue','Kai Rivers','Sunday Club','Léonie','Romy Skye','Eden Park','Lola June','Mister Moon']
const seed=(s:string)=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0)/4294967295}
const previous=(old:MarketChartEntry[]|undefined,id:string)=>old?.find(x=>x.id===id)

function rankBoard(
  market: typeof markets[number], kind: ChartKind, week:number, year:number,
  old:MarketChartEntry[]|undefined,
  ownItems:{id:string;name:string;artist:string;streams:number}[]
):MarketChartEntry[] {
  const competitors=Array.from({length:100},(_,i)=>{
    const n=i+1
    const name=market.names[n%market.names.length]+' '+(n+(kind==='albums'?3:kind==='artists'?7:0))
    const artist=kind==='artists'?name:rivalArtists[(n+(market.code==='UK'?3:market.code==='FR'?6:0))%rivalArtists.length]
    const id='rival-'+market.code+'-'+kind+'-'+n
    const variation=.72+seed(id+'-'+week+'-'+year)*.58
    const base=kind==='artists'?34_000_000:kind==='albums'?27_000_000:19_000_000
    const streams=Math.round(base/(Math.pow(n,kind==='artists'?.72:kind==='albums'?.8:.78))*variation*market.factor)
    return {id,name,artist,streams,own:false}
  })
  const own=ownItems.filter(x=>x.streams>0).map(x=>({...x,streams:Math.round(x.streams*market.ownFactor),own:true}))
  return [...competitors,...own].sort((a,b)=>b.streams-a.streams).slice(0,100).map((x,i)=>{
    const rank=i+1,prior=previous(old,x.id)
    const isNew=!prior
    const reentry=!!prior&&prior.weeks===0
    return { ...x,rank,lastWeek:prior?.rank??null,peak:prior?Math.min(prior.peak,rank):rank,weeks:prior?(prior.rank>0?prior.weeks+1:1):1,isNew,reentry }
  })
}

export function buildMarketCharts(artist:Artist, tracks:Artist['tracks'], week:number, year:number, old?:MarketCharts):MarketCharts {
  const oldBoard=old??({US:{artists:[],albums:[],songs:[]},UK:{artists:[],albums:[],songs:[]},FR:{artists:[],albums:[],songs:[]}} as MarketCharts)
  const trackItems=tracks.filter(t=>t.released).map(t=>({id:t.id,name:t.title,artist:artist.name,streams:Math.max(0,t.spotify-(artist.tracks.find(p=>p.id===t.id)?.spotify??0))}))
  const songItems=trackItems
  const albumItems=artist.releases.filter(r=>r.type==='Album').map(r=>({
    id:r.id,name:r.title,artist:artist.name,
    streams:r.trackIds.reduce((sum,trackId)=>sum+(trackItems.find(t=>t.id===trackId)?.streams??0),0)
  }))
  const artistStreams=trackItems.reduce((sum,t)=>sum+t.streams,0)
  const artistItems=artistStreams>0?[{id:'own-artist',name:artist.name,artist:artist.name,streams:artistStreams}]:[]
  return Object.fromEntries(markets.map(m=>[m.code,{
    artists:rankBoard(m,'artists',week,year,oldBoard[m.code]?.artists,artistItems),
    albums:rankBoard(m,'albums',week,year,oldBoard[m.code]?.albums,albumItems),
    songs:rankBoard(m,'songs',week,year,oldBoard[m.code]?.songs,songItems),
  }])) as MarketCharts
}
