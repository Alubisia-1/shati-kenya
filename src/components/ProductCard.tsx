import Link from 'next/link'
import { formatKES } from '@/src/lib/format'
export function ProductCard({ product }: { product: any }) {
  const total = (product.sizes || []).reduce((n: number, s: any) => n + Number(s.count || 0), 0)
  const low = total > 0 && total <= 3
  const photo = product.gallery?.[0]
  return <Link href={`/shop/${product.slug}`} className="product-card"><div className="product-art">{photo?.url ? <img src={photo.url} alt={photo.alt || product.name} style={{width:'100%',height:'100%',objectFit:'cover',position:'absolute',inset:0}}/> : <span className="image-index">{product.name}</span>}</div><span className="product-meta">{product.category}</span><span className="product-name">{product.name}</span><span>{formatKES(product.price)}</span><span className={`stock ${low?'low':''}`}>{total===0?'Stock being updated':low?'Last pieces':'In stock'}</span></Link>
}
