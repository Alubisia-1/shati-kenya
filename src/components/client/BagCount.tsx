'use client'
import { useEffect, useState } from 'react'
export function BagCount() { const [count, setCount] = useState(0); useEffect(() => { const read = () => { try { setCount(JSON.parse(localStorage.getItem('shati-bag') || '[]').length) } catch { setCount(0) } }; read(); window.addEventListener('storage', read); window.addEventListener('shati-bag-change', read); return () => { window.removeEventListener('storage', read); window.removeEventListener('shati-bag-change', read) } }, []); return <span>{count}</span> }
