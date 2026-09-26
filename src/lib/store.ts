import { getCMS } from './payload'

export async function getProducts() {
  try { const cms = await getCMS(); const res = await cms.find({ collection: 'products', where: { archived: { not_equals: true } }, sort: 'name', limit: 100, depth: 2 }); return res.docs as any[] }
  catch { return [] as any[] }
}
export async function getProduct(slug: string) {
  try { const cms = await getCMS(); const res = await cms.find({ collection: 'products', where: { slug: { equals: slug }, archived: { not_equals: true } }, limit: 1, depth: 2 }); return (res.docs[0] as any) || null }
  catch { return null }
}
export async function getCountyOptions() {
  try { const cms = await getCMS(); const res = await cms.find({ collection: 'counties', sort: 'name', limit: 50 }); return res.docs as any[] }
  catch { return [] as any[] }
}
export async function getDeliveryRates() {
  try { const cms = await getCMS(); const res = await cms.find({ collection: 'delivery-rates', limit: 3 }); return res.docs as any[] }
  catch { return [] as any[] }
}
export async function getLatestIssue() {
  try { const cms = await getCMS(); const res = await cms.find({ collection: 'issues', where: { publishAt: { less_than_equal: new Date().toISOString() } }, sort: '-publishAt', limit: 1, depth: 1 }); return (res.docs[0] as any) || null }
  catch { return null }
}
export async function getEpisodes() {
  try { const cms = await getCMS(); const res = await cms.find({ collection: 'episodes', sort: '-publishedAt', limit: 6, depth: 2 }); return res.docs as any[] }
  catch { return [] as any[] }
}
export async function getSettings() {
  try { const cms = await getCMS(); return await cms.findGlobal({ slug: 'settings' }) as any }
  catch { return { shopPhone: '+254 729 286626', whatsappGreeting: 'Hi SHATI, I have a question.' } as any }
}
