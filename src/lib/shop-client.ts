'use client'
export type BagItem = { id: string; slug: string; name: string; price?: number; size: string; quantity: number }
export function readBag(): BagItem[] { try { return JSON.parse(localStorage.getItem('shati-bag') || '[]') as BagItem[] } catch { return [] } }
export function saveBag(items: BagItem[]) { localStorage.setItem('shati-bag', JSON.stringify(items)); window.dispatchEvent(new Event('shati-bag-change')) }
export function trackOrder(page: string, piece?: string) { void fetch('/api/order-event', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ page, piece }) }).catch(() => {}) }
export function orderOnWhatsApp(page: string, piece = '', size = '') {
  const route=window.location.pathname
  const eventPage=page==='generic'?(route.startsWith('/shop/')?'product':route.startsWith('/shop')?'shop':route.startsWith('/watch')?'watch':route.startsWith('/league')?'league':route.startsWith('/bag')?'bag':'home'):page
  if(page==='bag'){const current=readBag();trackOrder(eventPage,current.map(item=>item.name).join(', '))}else trackOrder(eventPage,piece)
  const county = localStorage.getItem('shati-county') || 'Nairobi'
  let message = localStorage.getItem('shati-greeting') || 'Hi SHATI, I have a question.'
  if (page === 'product') message = `Hi SHATI, I would like the ${piece} in size ${size}, delivered to ${county}.`
  if (page === 'bag') { const bag = readBag(); message = `Hi SHATI, I would like to order:\n${bag.map((item) => `${item.quantity} x ${item.name}, size ${item.size}`).join('\n')}\nDeliver to: ${county}` }
  const phone = (localStorage.getItem('shati-phone') || '254729286626').replace(/\D/g, '')
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
}
