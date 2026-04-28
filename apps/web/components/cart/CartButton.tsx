'use client'
// components/cart/CartButton.tsx
// Botón flotante del carrito con badge de cantidad.
// Se integra en el Header y muestra el drawer.

import { useState } from 'react'
import { useCartStore } from '@/store/cart'
import { CartDrawer } from './CartDrawer'

interface Props {
  lang?: 'es' | 'en'
}

export function CartButton({ lang = 'es' }: Props) {
  const [open, setOpen] = useState(false)
  const count = useCartStore(s => s.itemCount())

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'relative',
          background: 'rgba(255,255,255,0.12)',
          border: '1.5px solid rgba(255,255,255,0.2)',
          borderRadius: 8, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 12px', color: '#fff',
          fontSize: 13, fontWeight: 600,
          fontFamily: 'Inter, sans-serif',
          transition: 'all .15s',
        }}
        aria-label={lang === 'es' ? 'Ver carrito' : 'View cart'}
      >
        <span style={{ fontSize: 16 }}>🛒</span>
        <span>{lang === 'es' ? 'Carrito' : 'Cart'}</span>
        {count > 0 && (
          <span style={{
            position: 'absolute', top: -6, right: -6,
            background: '#E65100', color: '#fff',
            borderRadius: '50%', width: 18, height: 18,
            fontSize: 10, fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid #1F3A93',
          }}>
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>
      <CartDrawer open={open} onClose={() => setOpen(false)} lang={lang} />
    </>
  )
}
