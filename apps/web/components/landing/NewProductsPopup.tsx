'use client'
// components/landing/NewProductsPopup.tsx
// Popup de productos nuevos — aparece 2s después de cargar el landing
// Se muestra una vez por día (sessionStorage con fecha)

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

const navy  = '#1F3A93'
const orange = '#E65100'

interface Product {
  id:           string
  name:         string
  mainImageUrl?: string
  category?:    { name: string }
}

export function NewProductsPopup() {
  const { locale } = useParams<{ locale: string }>()
  const [visible,  setVisible]  = useState(false)
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    // Verificar si ya se mostró hoy
    const today = new Date().toDateString()
    const shown = sessionStorage.getItem('pl_new_popup_date')
    if (shown === today) return

    // Cargar productos nuevos
    const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
    fetch(`${BASE}/api/products?isNew=true&limit=3&status=ACTIVE`)
      .then(r => r.json())
      .then(data => {
        const items = data.data ?? []
        if (items.length === 0) return
        setProducts(items)
        // Mostrar después de 2 segundos
        setTimeout(() => setVisible(true), 2000)
      })
      .catch(() => {})
  }, [])

  function close() {
    const today = new Date().toDateString()
    sessionStorage.setItem('pl_new_popup_date', today)
    setVisible(false)
  }

  if (!visible || products.length === 0) return null

  return (
    <>
      {/* Overlay */}
      <div
        onClick={close}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)',
          animation: 'fadeIn .3s ease',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        zIndex: 1001, width: '90%', maxWidth: 480,
        background: '#fff', borderRadius: 20,
        boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
        fontFamily: 'Inter, sans-serif',
        animation: 'slideUp .35s ease',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ background: navy, padding: '20px 24px 16px', position: 'relative' }}>
          <button onClick={close} style={{
            position: 'absolute', top: 12, right: 14,
            background: 'rgba(255,255,255,0.15)', border: 'none',
            color: '#fff', width: 28, height: 28, borderRadius: '50%',
            cursor: 'pointer', fontSize: 16, display: 'flex',
            alignItems: 'center', justifyContent: 'center', lineHeight: 1,
          }}>×</button>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 4px' }}>
            ✨ Novedades
          </p>
          <h2 style={{ color: '#fff', fontFamily: 'Poppins, sans-serif', fontSize: 20, fontWeight: 800, margin: 0 }}>
            Nuevos productos disponibles
          </h2>
        </div>

        {/* Productos */}
        <div style={{ padding: '16px 24px' }}>
          {products.map((p, i) => (
            <Link key={p.id} href={`/${locale}/catalog/${p.id}`} onClick={close}
              style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < products.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
              <div style={{ width: 52, height: 52, borderRadius: 10, background: '#F8FAFC', flexShrink: 0, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                {p.mainImageUrl
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={p.mainImageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📦</div>
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: orange, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 2px' }}>
                  {p.category?.name ?? 'Nuevo'}
                </p>
                <p style={{ color: '#0F172A', fontSize: 13, fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.name}
                </p>
              </div>
              <span style={{ color: navy, fontSize: 16, flexShrink: 0 }}>›</span>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '0 24px 20px', display: 'flex', gap: 10, flexDirection: 'column' }}>
          <Link href={`/${locale}/catalog?isNew=true`} onClick={close}
            style={{ display: 'block', background: navy, color: '#fff', textAlign: 'center', padding: '11px 0', borderRadius: 9, textDecoration: 'none', fontWeight: 700, fontSize: 14, fontFamily: 'Poppins, sans-serif' }}>
            Ver todos los productos nuevos →
          </Link>
          <button onClick={close} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            No gracias, seguir navegando
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translate(-50%,-46%) } to { opacity: 1; transform: translate(-50%,-50%) } }
      `}</style>
    </>
  )
}
