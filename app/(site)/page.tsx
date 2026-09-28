import Link from 'next/link'
import { readdir } from 'node:fs/promises'
import path from 'node:path'
import { CategoryCard } from '@/src/components/client/CategoryCard'
import { ProductCard } from '@/src/components/ProductCard'
import { getEpisodes, getLatestIssue, getProducts } from '@/src/lib/store'

export const dynamic = 'force-dynamic'

const categories = [
  { name: 'Shirts', folder: 'Shirts', number: '01' },
  { name: 'Quarter-zips', folder: 'Quater-Zips', number: '02' },
  { name: 'Linen pants', folder: 'Linen-Pants', number: '03' },
  { name: 'Caps', folder: 'Caps', number: '04' },
]

async function getCategoryImages(folder: string) {
  const directory = path.join(process.cwd(), 'public', 'product-images', folder)
  const files = await readdir(directory, { withFileTypes: true })

  return files
    .filter((file) => file.isFile() && /\.(jpe?g|png|webp|avif)$/i.test(file.name))
    .map((file) => file.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
    .map((filename) => `/product-images/${encodeURIComponent(folder)}/${encodeURIComponent(filename)}`)
}

export default async function HomePage() {
  const [products, issue, episodes, categoriesWithImages] = await Promise.all([
    getProducts(),
    getLatestIssue(),
    getEpisodes(),
    Promise.all(categories.map(async (category) => ({
      ...category,
      images: await getCategoryImages(category.folder),
    }))),
  ])
  const featured = products.slice(0, 4)
  const episode = episodes[0]

  return <>
    <div className="wrap">
      <section className="hero">
        <div>
          <span className="eyebrow">The cover · Issue {issue?.number || '00'}</span>
          <h1>{issue?.coverLine || <>Uniforms are<br/><em>for school.</em></>}</h1>
          <p className="hero-copy">Menswear from our Nairobi CBD store. Shirts, quarter-zips, linen pants, caps, and the official shirt for the event on your calendar. Delivered to all 47 counties.</p>
          <div className="hero-ctas">
            <Link className="button" href="/shop">Shop the rail <span>↗</span></Link>
            <Link className="text-link" href="/watch">Watch the latest</Link>
          </div>
          <p className="fine" style={{ marginTop: 22 }}>On the cover: {issue?.coverCredit || 'Made in Nairobi · Delivered to all 47 counties'}</p>
        </div>
        <div className="editorial-image">
          {issue?.cover?.url
            ? <img src={issue.cover.url} alt={issue.cover.alt || issue.coverLine} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
            : <span className="image-index">SHATI — NAIROBI · 001</span>}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div><span className="eyebrow">The collection</span><h2>Shop by piece.</h2></div>
          <Link className="text-link" href="/shop">See the full rail ↗</Link>
        </div>
        <div className="category-grid">
          {categoriesWithImages.map((category) => (
            <CategoryCard
              key={category.name}
              name={category.name}
              number={category.number}
              images={category.images}
              href={`/shop?category=${encodeURIComponent(category.name)}`}
            />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div><span className="eyebrow">From the CBD store</span><h2>New on the rail.</h2></div>
          <p>What you see is in the CBD store today. When a piece is gone, it leaves the rail.</p>
        </div>
        {featured.length
          ? <div className="products">{featured.map((product: any) => <ProductCard key={product.id} product={product}/>)}</div>
          : <p>New pieces are being added to the rail. Check back soon or <a className="text-link" href="/shop">explore the rail.</a></p>}
      </section>
    </div>

    <section className="split">
      <div className="split-art"/>
      <div className="split-copy">
        <span className="eyebrow">The weekly show</span>
        <h2>Good clothes.<br/>Good conversation.</h2>
        <p>{episode?.title || 'Fit, people, place, and the game. Four shows made in Nairobi, every week.'}</p>
        <Link href="/watch" className="button">Watch SHATI <span>↗</span></Link>
      </div>
    </section>

    <section className="county-band">
      <div><span className="eyebrow">The SHATI county league</span><h2>Play for your county.</h2></div>
      <div>
        <p>A free Fantasy Premier League mini-league. No purchase, no prizes. Just county pride and a weekly table.</p>
        <Link className="text-link" href="/league" style={{ display: 'inline-block', marginTop: 18 }}>Find your county ↗</Link>
      </div>
    </section>
  </>
}
