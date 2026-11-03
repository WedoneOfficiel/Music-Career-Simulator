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
const establishedRivals=['Luna Vale','The Velvet Hours','Milo June','Nova Grey','Éloïse','Jade Rivers','Sienna Rose','Atlas Bloom','Maya Sol','Noah West','Iris Monroe','The Satellites','Ariane Blue','Kai Rivers','Sunday Club','Léonie','Romy Skye','Eden Park','Lola June','Mister Moon']
const extraFirstNames=['Avery','Rowan','Camille','Theo','Amara','Ellis','Margot','Luca','Celeste','Julian','Maeve','Adrian','Noémie','Felix','Esme','Leon','Skye','Remy','Clara','August']
const extraSurnames=['Hart','Knight','Laurent','Sinclair']
const rivalArtists=[...establishedRivals,...Array.from({length:80},(_,i)=>extraFirstNames[i%20]+' '+extraSurnames[Math.floor(i/20)])]
const songTitles=['Paper Moons','Out of the Blue','Glass Houses','Slow Motion','Electric Touch','Wildfire Season','No Apologies','Velvet Rope','Anywhere Tonight','Fever Letters','Satellite Heart','Little Disasters','Golden','Better in the Dark','The Last Summer','City of Angels','Blue Hour','Beautiful Mess','Stay for the Lights','Almost Famous']
const albumTitles=['First Light','Parallel Lines','The Good Part','Everything Changes','After the Noise','Soft Focus','Open Season','The Art of Leaving','Neon Years','A Different Sky']
const seed=(s:string)=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0)/4294967295}
const previous=(old:MarketChartEntry[]|undefined,id:string)=>old?.find(x=>x.id===id)
const absoluteWeek=(week:number,year:number)=>year*52+week

export type RivalMarketEvent={id:string;artist:string;kind:'viral'|'blockbuster'|'comeback';headline:boolean}
export function getRivalMarketEvent(week:number,year:number):RivalMarketEvent|null{
  const now=absoluteWeek(week,year),cycle=Math.floor(now/9),age=((now%9)+9)%9
  if(age>=3)return null
  const index=Math.floor(seed('industry-event-'+cycle)*rivalArtists.length)
  const roll=seed('industry-event-kind-'+cycle)
  const kind=roll<.42?'viral':roll<.76?'blockbuster':'comeback'
  return {id:'industry-event-'+cycle,artist:rivalArtists[index],kind,headline:age===0}
}

function finishBoard(
  entries:{id:string;name:string;artist:string;streams:number;own:boolean}[],
  old:MarketChartEntry[]|undefined
):MarketChartEntry[] {
  return entries.sort((a,b)=>b.streams-a.streams).slice(0,100).map((x,i)=>{
    const rank=i+1,prior=previous(old,x.id)
    return {...x,rank,lastWeek:prior?.rank??null,peak:prior?Math.min(prior.peak,rank):rank,weeks:prior?(prior.rank>0?prior.weeks+1:1):1,isNew:!prior,reentry:!!prior&&prior.weeks===0}
  })
}

/* Rival identities and catalogue slots persist from week to week. Their lead singles
   rotate every 32 weeks; older songs and albums have a slower catalogue decay. */
function rivalMarket(market:typeof markets[number],week:number,year:number){
  const now=absoluteWeek(week,year)
  const event=getRivalMarketEvent(week,year)
  const tracks:{id:string;name:string;artist:string;streams:number;artistId:string;slot:number}[]=[]
  const artists:{id:string;name:string;artist:string;streams:number}[]=[]
  const albums:{id:string;name:string;artist:string;streams:number}[]=[]
  const songShares=[.38,.23,.17,.13,.09]
  const albumShares=[.34,.25,.19,.13,.09]
  rivalArtists.forEach((name,index)=>{
    const artistId='rival-artist-'+index
    const fans=58_000_000*Math.pow(.94,index)
    const popularity=Math.max(34,97-index*.58)
    const homeMarket=index%3
    const localFactor=homeMarket===(market.code==='US'?0:market.code==='UK'?1:2)?1.16:.94
    const cyclePosition=((now+index*13)%32+32)%32
    const cycle=Math.floor((now+index*13)/32)
    const leadAge=cyclePosition
    const momentum=.88+seed(artistId+'-era-'+Math.floor(now/8))*.34
    const weeklyPotential=(fans*.54+popularity*300)*(.62+popularity/65)*market.factor*localFactor*momentum
    const artistTracks=songShares.map((share,slot)=>{
      const isLead=slot===0
      const age=isLead?leadAge:((index*17+slot*29)%88)+12
      const decay=Math.max(.12,1-age*(isLead ? .021 : .014))
      const releaseLift=isLead&&age<5?1.22:1
      const id=isLead?artistId+'-lead-'+cycle:artistId+'-catalogue-'+slot
      const title=songTitles[(index*3+(isLead?cycle:slot*4+index))%songTitles.length]
      const eventMultiplier=event?.artist===name&&(event.kind==='viral'&&isLead?2.15:event.kind==='comeback'&&slot===2?2.05:event.kind==='blockbuster'?1.28:1):1
      const weekly=Math.round(weeklyPotential*share*decay*releaseLift*eventMultiplier*(.84+seed(id+'-'+Math.floor(now/2))*.32))
      return {id,name:title,artist:name,streams:weekly,artistId,slot}
    })
    tracks.push(...artistTracks)
    const artistTotal=artistTracks.reduce((sum,t)=>sum+t.streams,0)
    artists.push({id:artistId,name,artist:name,streams:artistTotal})
    // Chaque artiste lance un nouvel album environ une fois par an.
    // Les deux précédents restent au catalogue avec une décroissance progressive.
    const albumEra=Math.floor((now+index*19)/52)
    const albumAge=((now+index*19)%52+52)%52
    ;[0,1,2].forEach(ageOffset=>{
      const era=albumEra-ageOffset
      const age=albumAge+ageOffset*52
      const albumId=artistId+'-album-era-'+era
      const title=albumTitles[((index*2+era)%albumTitles.length+albumTitles.length)%albumTitles.length]
      const share=albumShares[ageOffset]
      const decay=Math.max(.055,1-age*.0085)
      const launchLift=age<4?1.95:age<9?1.38:1
      const eventMultiplier=event?.artist===name&&event.kind==='blockbuster'?1.9:1
      const streams=Math.round(weeklyPotential*share*decay*launchLift*eventMultiplier*(.86+seed(albumId+'-'+Math.floor(now/3))*.28))
      albums.push({id:albumId,name:title,artist:name,streams})
    })
  })

  // Collaborations ponctuelles entre concurrents : elles créent de nouveaux titres
  // identifiables dans les charts, avec un pic de lancement puis une retombée.
  const collaborationCycle=Math.floor(now/26)
  const collaborationAge=((now%26)+26)%26
  if(collaborationAge<18){
    for(let slot=0;slot<5;slot++){
      const first=(collaborationCycle*7+slot*17+3)%rivalArtists.length
      let second=(first+7+slot*11+collaborationCycle*3)%rivalArtists.length
      if(second===first)second=(second+1)%rivalArtists.length
      const firstName=rivalArtists[first],secondName=rivalArtists[second]
      const collaborationId='rival-collab-'+collaborationCycle+'-'+slot
      const title=songTitles[(collaborationCycle*5+slot*3+first)%songTitles.length]
      const baseFans=(58_000_000*Math.pow(.94,first)+58_000_000*Math.pow(.94,second))*.29
      const streams=Math.round(baseFans*market.factor*(collaborationAge<3?1.65:collaborationAge<8?1.22:Math.max(.35,1-collaborationAge*.035))*(.88+seed(collaborationId+'-'+Math.floor(now/2))*.24))
      tracks.push({id:collaborationId,name:title,artist:firstName+' feat. '+secondName,streams,artistId:collaborationId,slot:5})
    }
  }
  return {artists,albums,tracks}
}

export function buildMarketCharts(artist:Artist, tracks:Artist['tracks'], week:number, year:number, old?:MarketCharts):MarketCharts {
  const oldBoard=old??({US:{artists:[],albums:[],songs:[]},UK:{artists:[],albums:[],songs:[]},FR:{artists:[],albums:[],songs:[]}} as MarketCharts)
  const trackItems=tracks.filter(t=>t.released).map(t=>({id:t.id,name:t.title,artist:artist.name,streams:Math.max(0,t.spotify-(artist.tracks.find(p=>p.id===t.id)?.spotify??0))}))
  const albumItems=artist.releases.filter(r=>r.type==='Album').map(r=>({
    id:r.id,name:r.title,artist:artist.name,
    streams:r.trackIds.reduce((sum,trackId)=>sum+(trackItems.find(t=>t.id===trackId)?.streams??0),0)
  }))
  const artistStreams=trackItems.reduce((sum,t)=>sum+t.streams,0)
  const artistItems=artistStreams>0?[{id:'own-artist',name:artist.name,artist:artist.name,streams:artistStreams}]:[]
  return Object.fromEntries(markets.map(m=>{
    const rivals=rivalMarket(m,week,year)
    return [m.code,{
      artists:finishBoard([...rivals.artists.map(x=>({...x,own:false})),...artistItems.map(x=>({...x,streams:Math.round(x.streams*m.ownFactor),own:true}))],oldBoard[m.code]?.artists),
      albums:finishBoard([...rivals.albums.map(x=>({...x,own:false})),...albumItems.map(x=>({...x,streams:Math.round(x.streams*m.ownFactor),own:true}))],oldBoard[m.code]?.albums),
      songs:finishBoard([...rivals.tracks.map(x=>({id:x.id,name:x.name,artist:x.artist,streams:Math.round(x.streams*m.factor),own:false})),...trackItems.map(x=>({...x,streams:Math.round(x.streams*m.ownFactor),own:true}))],oldBoard[m.code]?.songs),
    }]
  })) as MarketCharts
}
