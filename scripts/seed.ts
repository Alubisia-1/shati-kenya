import 'dotenv/config'
import config from '../payload.config'
import { getPayload } from 'payload'
import { countyNames } from '../src/data/counties'
import type { Show } from '../src/payload-types'

const payload=await getPayload({config})
for(const [i,name] of countyNames.entries()){
  const existing=await payload.find({collection:'counties',where:{name:{equals:name}},limit:1,overrideAccess:true})
  if(!existing.docs.length)await payload.create({collection:'counties',overrideAccess:true,data:{name,code:`KE-${String(i+1).padStart(2,'0')}`}})
}
const shows: Pick<Show, 'name' | 'description'>[] = [
  { name: 'The Court', description: 'People, style and the city.' },
  { name: 'Fit School', description: 'Getting dressed well.' },
  { name: 'Maskani', description: 'At home in Nairobi.' },
  { name: 'The Gameweek', description: 'Fantasy Premier League by county.' },
]
for (const { name, description } of shows) {
  const existing = await payload.find({ collection: 'shows', where: { name: { equals: name } }, limit: 1, overrideAccess: true })
  if (!existing.docs.length) {
    await payload.create({ collection: 'shows', overrideAccess: true, data: { name, description, cadence: 'Weekly', mode: 'day' } })
  }
}
const settings=await payload.findGlobal({slug:'settings',overrideAccess:true})
if(!settings.shopPhone)await payload.updateGlobal({slug:'settings',overrideAccess:true,data:{shopPhone:process.env.SHOP_PHONE||'+254 729 286626',whatsappGreeting:'Hi SHATI, I have a question.'}})
console.log(`Seeded ${countyNames.length} counties and ${shows.length} shows. Delivery fees, bands, products, photos and playlist IDs need SHATI's confirmed data.`)
process.exit(0)
