'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import styles from './CategoryCard.module.css'

type CategoryCardProps = {
  name: string
  number: string
  images: string[]
  href: string
}

const rotationInterval = 5000

export function CategoryCard({ name, number, images, href }: CategoryCardProps) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (images.length < 2) return

    const interval = window.setInterval(() => {
      setStep((current) => current + 1)
    }, rotationInterval)

    return () => window.clearInterval(interval)
  }, [images.length])

  const imageSizes = '(max-width: 760px) 50vw, 22vw'
  const currentIndex = images.length ? step % images.length : 0
  const previousIndex = images.length ? (currentIndex + images.length - 1) % images.length : 0
  const activeLayer = step % 2

  return (
    <Link className="category-card" href={href}>
      <div className={`category-art${images.length ? ' has-rotating-images' : ''}`}>
        {images.length === 1 && (
          <Image src={images[0]} alt="" fill sizes={imageSizes} className={`${styles.categorySlide} ${styles.active}`} />
        )}
        {images.length > 1 && [0, 1].map((layer) => {
          const isActive = layer === activeLayer
          const imageIndex = isActive ? currentIndex : previousIndex

          return (
            <Image
              key={`layer-${layer}`}
              src={images[imageIndex]}
              alt=""
              fill
              sizes={imageSizes}
              className={`${styles.categorySlide}${isActive ? ` ${styles.active}` : ''}`}
            />
          )
        })}
        <b aria-hidden="true">{number}</b>
      </div>
      <span>{name}</span>
    </Link>
  )
}
