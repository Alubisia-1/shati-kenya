import type { Metadata } from 'next'
import Link from 'next/link'
import { ProductCard } from '@/src/components/ProductCard'
import { getProducts } from '@/src/lib/store'
import { ShopFilters } from '@/src/components/client/ShopFilters'
export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'The Rail' }
export default async function ShopPage({ searchParams }: {searchParams: Promise<{category?:string}>}) { const [{category},products] = await Promise.all([searchParams,getProducts()]); const filtered = category ? products.filter((p:any)=>p.category===category) : products; return <div className="wrap"><section className="subhero"><span className="eyebrow">Made in Nairobi · Stock moves daily</span><h1 className="page-title">The rail.</h1></section><ShopFilters active={category || 'All'}/><Link className="text-link" href="/watch#shows">Not sure of your size? Fit School can help ↗</Link><section className="section" style={{border:0,paddingTop:24}}>{filtered.length?<div className="products">{filtered.map((p:any)=><ProductCard key={p.id} product={p}/>)}</div>:<div><p>No pieces are listed in this category right now. The shop is adding its current stock.</p><p style={{marginTop:12}}>Use the Order on WhatsApp button to ask the shop what’s available.</p></div>}</section></div> }
