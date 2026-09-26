import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getProduct, getCountyOptions, getDeliveryRates, getEpisodes } from '@/src/lib/store'
import { ProductClient } from '@/src/components/client/ProductClient'
export const dynamic = 'force-dynamic'
type Props={params:Promise<{slug:string}>}
export async function generateMetadata({params}:Props):Promise<Metadata>{const {slug}=await params;const p=await getProduct(slug);return {title:p?.name||'Piece',description:p?.description||'Menswear from Nairobi.'}}
export default async function ProductPage({params}:Props){const {slug}=await params;const [product,counties,rates,episodes]=await Promise.all([getProduct(slug),getCountyOptions(),getDeliveryRates(),getEpisodes()]);if(!product)notFound();return <ProductClient product={product} counties={counties} rates={rates} fitSchoolEpisode={episodes.find((e:any)=>e.show?.name==='Fit School')}/>}
