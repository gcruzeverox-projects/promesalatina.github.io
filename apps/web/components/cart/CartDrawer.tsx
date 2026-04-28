'use client'
// components/cart/CartDrawer.tsx
// Drawer lateral del carrito B2B — se abre desde cualquier página.
// Muestra items, cantidades editables, tipo de empaque y totales.

import { useState } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/store/cart'
import type { UnitType } from '@/store/cart'

const navy   = '#1F3A93'
const orange = '#E65100'

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

interface Props {
  open:    boolean
  onClose: () => void
  lang?:   'es' | 'en'
}

export function CartDrawer({ open, onClose, lang = 'es' }: Props) {
  const { items, removeItem, updateQuantity, updateUnitType, subtotal, clearCart } = useCartStore()

  const t = {
    title:     lang === 'es' ? 'Orden de Compra'          : 'Purchase Order',
    empty:     lang === 'es' ? 'Tu carrito está vacío'     : 'Your cart is empty',
    emptySub:  lang === 'es' ? 'Agrega productos del catálogo' : 'Add products from the catalog',
    browse:    lang === 'es' ? 'Ver catálogo'              : 'Browse catalog',
    subtotal:  lang === 'es' ? 'Subtotal estimado'         : 'Estimated subtotal',
    note:      lang === 'es' ? 'Los precios finales se confirman en la cotización' : 'Final prices confirmed in the quote',
    checkout:  lang === 'es' ? 'Solicitar cotización'      : 'Request quote',
    clear:     lang === 'es' ? 'Vaciar carrito'            : 'Clear cart',
    caja:      lang === 'es' ? 'Caja'                      : 'Case',
    paquete:   lang === 'es' ? 'Paquete'                   : 'Pack',
  }

  if (!open) return null

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, backdropFilter: 'blur(2px)' }}
      />

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 420, maxWidth: '95vw',
        background: '#fff', zIndex: 201,
        display: 'flex', flexDirection: 'column',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.18)',
        fontFamily: 'Inter, sans-serif',
      }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid #E2E8F0', background: navy }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>🛒</span>
            <div>
              <h2 style={{ color: '#fff', fontFamily: 'Poppins, sans-serif', fontSize: 16, fontWeight: 700, margin: 0 }}>{t.title}</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, margin: 0 }}>{items.length} {lang === 'es' ? 'productos' : 'products'}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '56px 24px' }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>📦</div>
              <p style={{ fontWeight: 600, color: '#0F172A', fontSize: 15, margin: '0 0 6px' }}>{t.empty}</p>
              <p style={{ color: '#94A3B8', fontSize: 13, margin: '0 0 20px' }}>{t.emptySub}</p>
              <Link href="/catalog" onClick={onClose} style={{ background: navy, color: '#fff', padding: '10px 20px', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                {t.browse}
              </Link>
            </div>
          ) : (
            items.map(item => (
              <div key={item.productId} style={{ padding: '12px 20px', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  {/* Imagen */}
                  <div style={{ width: 52, height: 52, borderRadius: 8, background: '#F1F5F9', flexShrink: 0, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                    {item.imageUrl
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📦</div>
                    }
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: 13, color: '#0F172A', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                    <p style={{ fontSize: 10, color: '#94A3B8', margin: '0 0 8px', fontFamily: 'monospace' }}>{item.sku}</p>

                    {/* Tipo de empaque */}
                    <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                      {(['caja', 'paquete'] as UnitType[]).map(type => (
                        <button key={type} onClick={() => updateUnitType(item.productId, type)}
                          style={{
                            padding: '3px 10px', borderRadius: 5, border: '1.5px solid',
                            borderColor: item.unitType === type ? navy : '#E2E8F0',
                            background: item.unitType === type ? navy : '#fff',
                            color: item.unitType === type ? '#fff' : '#64748B',
                            fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all .15s',
                          }}
                        >
                          {type === 'caja' ? t.caja : t.paquete}
                        </button>
                      ))}
                    </div>

                    {/* Cantidad + precio */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= item.moq}
                          style={{ width: 26, height: 26, borderRadius: '50%', border: '1.5px solid #E2E8F0', background: '#F8FAFC', cursor: item.quantity <= item.moq ? 'not-allowed' : 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: item.quantity <= item.moq ? 0.4 : 1 }}>−</button>
                        <span style={{ fontWeight: 700, fontSize: 14, minWidth: 24, textAlign: 'center', color: '#0F172A' }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          style={{ width: 26, height: 26, borderRadius: '50%', border: '1.5px solid #E2E8F0', background: '#F8FAFC', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: 700, fontSize: 14, color: navy, margin: 0 }}>${fmt(item.basePrice * item.quantity)}</p>
                        <p style={{ fontSize: 10, color: '#94A3B8', margin: 0 }}>${fmt(item.basePrice)}/{item.unitType}</p>
                      </div>
                    </div>
                  </div>

                  {/* Eliminar */}
                  <button onClick={() => removeItem(item.productId)}
                    style={{ background: 'none', border: 'none', color: '#CBD5E1', cursor: 'pointer', fontSize: 16, padding: 2, flexShrink: 0 }}
                    title="Eliminar">🗑️</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer con totales */}
        {items.length > 0 && (
          <div style={{ padding: '16px 20px', borderTop: '1px solid #E2E8F0', background: '#FAFBFD' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: '#64748B', fontSize: 13 }}>{t.subtotal}</span>
              <span style={{ fontWeight: 800, fontSize: 18, color: navy, fontFamily: 'Poppins, sans-serif' }}>${fmt(subtotal())}</span>
            </div>
            <p style={{ fontSize: 11, color: '#94A3B8', margin: '0 0 14px', textAlign: 'center' }}>⚠️ {t.note}</p>
            <Link
              href="/checkout"
              onClick={onClose}
              style={{ display: 'block', width: '100%', background: orange, color: '#fff', padding: '13px 0', borderRadius: 8, textAlign: 'center', textDecoration: 'none', fontWeight: 700, fontSize: 14, fontFamily: 'Poppins, sans-serif', marginBottom: 8 }}
            >
              {t.checkout} →
            </Link>
            <button onClick={() => { clearCart(); onClose() }}
              style={{ width: '100%', background: 'none', border: '1px solid #E2E8F0', borderRadius: 8, padding: '9px 0', color: '#94A3B8', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              {t.clear}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
