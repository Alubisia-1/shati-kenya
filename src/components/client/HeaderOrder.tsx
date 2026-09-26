'use client'
import { usePathname } from 'next/navigation'
import { trackOrder } from '@/src/lib/shop-client'

export function HeaderOrder({ phone, greeting }: { phone: string; greeting: string }) {
  const path = usePathname()
  const piece = path.startsWith('/shop/') ? decodeURIComponent(path.split('/').at(-1) || '') : ''
  const page = piece ? 'product' : path.startsWith('/shop') ? 'shop' : path.startsWith('/watch') ? 'watch' : path.startsWith('/league') ? 'league' : path.startsWith('/bag') ? 'bag' : 'home'
  const order = () => {
    let selected = piece
    if (page === 'bag') {
      try { selected = JSON.parse(localStorage.getItem('shati-bag') || '[]').map((row: { name: string }) => row.name).join(', ') } catch { selected = '' }
    }
    trackOrder(page, selected)
  }
  return <a className="button small-button" href={`https://wa.me/${phone}?text=${encodeURIComponent(greeting)}`} target="_blank" rel="noreferrer" onClick={order}>Order on WhatsApp <span>↗</span></a>
}
