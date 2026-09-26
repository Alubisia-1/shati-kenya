'use client'
import { useRouter } from 'next/navigation'
const categories=['All','Shirts','Quarter-zips','Linen pants','Caps','Official and events']
export function ShopFilters({active}:{active:string}) { const router=useRouter(); return <div className="filter-row" aria-label="Filter products">{categories.map((c)=><button type="button" key={c} className="chip" aria-pressed={active===c} onClick={()=>router.push(c==='All'?'/shop':`/shop?category=${encodeURIComponent(c)}`)}>{c}</button>)}</div> }
