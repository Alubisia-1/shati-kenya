import type { Metadata } from 'next'
import { BagClient } from '@/src/components/client/BagClient'
import { getCountyOptions } from '@/src/lib/store'
import { countyNames } from '@/src/data/counties'
export const metadata: Metadata={title:'Your bag'}
export default async function BagPage(){const records=await getCountyOptions();const names=records.length?records.map((c:any)=>c.name):countyNames;return <div className="wrap"><section className="subhero"><span className="eyebrow">A note to the shop</span><h1 className="page-title">Your bag.</h1></section><BagClient counties={names}/></div>}
