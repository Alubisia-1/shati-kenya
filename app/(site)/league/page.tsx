import type { Metadata } from 'next'
import { getCMS } from '@/src/lib/payload'
import { getCountyOptions, getEpisodes, getProducts, getSettings } from '@/src/lib/store'
import { countyNames } from '@/src/data/counties'
import { LeagueClient } from '@/src/components/client/LeagueClient'
export const dynamic='force-dynamic'
export const metadata:Metadata={title:'County League'}
export default async function LeaguePage(){let snapshot:any=null;try{const cms=await getCMS();const result=await cms.find({collection:'league-snapshots',sort:'-updatedAt',limit:1});snapshot=result.docs[0]||null}catch{}const [docs,products,episodes,settings]=await Promise.all([getCountyOptions(),getProducts(),getEpisodes(),getSettings()]);const counties=docs.length?docs.map((c:any)=>({id:c.id,name:c.name})):countyNames.map(name=>({id:'',name}));return <div className="wrap"><section className="subhero"><span className="eyebrow">The SHATI county league · Free to join</span><h1 className="page-title">Represent your county.</h1></section><LeagueClient counties={counties} snapshot={snapshot} products={products.slice(0,4)} episode={episodes.find((e:any)=>e.show?.name==='The Gameweek')} memberPricePercent={settings.memberPricePercent}/></div>}
