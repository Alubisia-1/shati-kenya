'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
export function SectionNavigation({desktop=false}:{desktop?:boolean}){const path=usePathname();return <nav className={desktop?'desktop-nav':'mobile-tabs'} aria-label="Sections">{[['/shop','Shop'],['/watch','Watch'],['/league','League']].map(([href,label])=><Link key={href} href={href} aria-current={path===href||path.startsWith(`${href}/`)?'page':undefined}>{label}</Link>)}</nav>}
