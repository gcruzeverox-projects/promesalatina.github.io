'use client'
// apps/web/components/catalog/ProductCard.tsx
// Tarjeta de producto para el catálogo B2B.
// Integrada con Zustand cart store. Soporta agregar/actualizar cantidad,
// selector de empaque (caja/paquete), y link a detalle del producto.

import Link from 'next/link'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useCartStore } from '@/store/cart'
import type { UnitType } from '@/store/cart'

const navy   = '#1F3A93'
const orange = '#E65100'
const green  = '#16a34a'

interface Product {
  id:              string
  name:            string
  nameEn?:         string
  sku:             string
  basePrice:       number
  stockQuantity:   number
  moq:             number
  unitsPerCase:    number
  unitsPerPack:    number
  isNew:           boolean
  isTopSeller:     boolean
  mainImageUrl?:   string
  category?:       { name: string }
  countryOfOrigin?: string
}

interface Props {
  product:  Product
  lang?:    'es' | 'en'
  onToast?: (msg: string) => void
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function ProductCard({ product, lang = 'es', onToast }: Props) {
  const { locale } = useParams<{ locale: string }>()
  const { addItem, isInCart, getItem, updateQuantity } = useCartStore()
  const [qty,      setQty]      = useState(1)
  const [unitType, setUnitType] = useState<UnitType>('caja')
  const [adding,   setAdding]   = useState(false)

  const inCart     = isInCart(product.id)
  const cartItem   = getItem(product.id)
  const outOfStock = product.stockQuantity === 0

  async function handleAdd(e: React.MouseEvent) {
    e.preventDefault()   // no navegar al hacer clic en el botón
    if (outOfStock) return
    setAdding(true)

    if (inCart && cartItem) {
      updateQuantity(product.id, cartItem.quantity + qty)
      onToast?.(lang === 'es'
        ? `Cantidad actualizada: ${cartItem.quantity + qty} ${unitType}(s)`
        : `Quantity updated: ${cartItem.quantity + qty} ${unitType}(s)`)
    } else {
      addItem({
        productId:     product.id,
        name:          product.name,
        nameEn:        product.nameEn ?? product.name,
        sku:           product.sku,
        unitType,
        quantity:      qty,
        basePrice:     product.basePrice,
        imageUrl:      product.mainImageUrl ?? '',
        unitsPerCase:  product.unitsPerCase,
        unitsPerPack:  product.unitsPerPack,
        moq:           product.moq,
        categoryName:  product.category?.name ?? '',
        stockQuantity: product.stockQuantity,
      })
      setQty(1)
      onToast?.(lang === 'es'
        ? `${product.name} agregado al carrito`
        : `${product.name} added to cart`)
    }

    setTimeout(() => setAdding(false), 600)
  }

  return (
    <Link href={`/${locale}/catalog/${product.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: '#fff',
        border: `1.5px solid ${inCart ? navy : '#E2E8F0'}`,
        borderRadius: 12,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all .2s',
        fontFamily: 'Inter, sans-serif',
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement
          if (!inCart) el.style.borderColor = navy
          el.style.transform = 'translateY(-2px)'
          el.style.boxShadow = '0 8px 24px rgba(31,58,147,0.12)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement
          if (!inCart) el.style.borderColor = '#E2E8F0'
          el.style.transform = 'translateY(0)'
          el.style.boxShadow = 'none'
        }}
      >
        {/* Imagen */}
        <div style={{ position: 'relative', height: 180, background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
          {product.mainImageUrl
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={product.mainImageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8, transition: 'transform .3s' }} />
            : <div style={{ fontSize: 48, color: '#CBD5E1' }}>📦</div>
          }

          {/* Badges */}
          <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {product.isNew && (
              <span style={{ background: navy, color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4, letterSpacing: '0.04em' }}>NUEVO</span>
            )}
            {product.isTopSeller && (
              <span style={{ background: orange, color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4 }}>TOP</span>
            )}
            {outOfStock && (
              <span style={{ background: '#EF4444', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4 }}>AGOTADO</span>
            )}
          </div>

          {/* Badge "En carrito" */}
          {inCart && (
            <div style={{ position: 'absolute', top: 8, right: 8, background: navy, color: '#fff', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>
              🛒
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', flex: 1 }}>
          {product.category && (
            <p style={{ fontSize: 10, fontWeight: 700, color: orange, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>
              {product.category.name}
            </p>
          )}

          <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, fontWeight: 700, color: '#0F172A', margin: '0 0 3px', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {product.name}
          </p>

          <p style={{ fontSize: 10, color: '#94A3B8', margin: '0 0 8px', fontFamily: 'monospace' }}>
            {product.sku}
          </p>

          {/* Stock */}
          <p style={{ fontSize: 11, fontWeight: 600, margin: '0 0 8px', color: outOfStock ? '#EF4444' : product.stockQuantity < 10 ? '#F59E0B' : green }}>
            {outOfStock ? '⚠ Sin stock' : `✓ ${product.stockQuantity} cajas disp.`}
          </p>

          {/* Selector tipo */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 10 }} onClick={e => e.preventDefault()}>
            {(['caja', 'paquete'] as UnitType[]).map(type => (
              <button key={type}
                onClick={e => { e.preventDefault(); setUnitType(type) }}
                style={{
                  flex: 1, padding: '4px 6px', borderRadius: 5, border: '1.5px solid',
                  borderColor: unitType === type ? navy : '#E2E8F0',
                  background: unitType === type ? navy : '#fff',
                  color: unitType === type ? '#fff' : '#64748B',
                  fontSize: 10, fontWeight: 600, cursor: 'pointer', transition: 'all .15s',
                }}>
                {type === 'caja' ? `Caja ×${product.unitsPerCase}` : `Pack ×${product.unitsPerPack}`}
              </button>
            ))}
          </div>

          {/* Cantidad + precio */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }} onClick={e => e.preventDefault()}>
            <button onClick={e => { e.preventDefault(); setQty(q => Math.max(1, q - 1)) }}
              disabled={qty <= 1}
              style={{ width: 26, height: 26, borderRadius: '50%', border: '1.5px solid #E2E8F0', background: '#F8FAFC', cursor: qty <= 1 ? 'not-allowed' : 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: qty <= 1 ? 0.4 : 1 }}>
              −
            </button>
            <span style={{ fontWeight: 800, fontSize: 14, minWidth: 22, textAlign: 'center', color: navy }}>{qty}</span>
            <button onClick={e => { e.preventDefault(); setQty(q => q + 1) }}
              style={{ width: 26, height: 26, borderRadius: '50%', border: '1.5px solid #E2E8F0', background: '#F8FAFC', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              +
            </button>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <p style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 15, color: navy, margin: 0 }}>
                ${fmt(product.basePrice * qty)}
              </p>
              <p style={{ fontSize: 9, color: '#94A3B8', margin: 0 }}>
                ${fmt(product.basePrice)}/{unitType}
              </p>
            </div>
          </div>

          {/* Botón agregar */}
          <button
            onClick={handleAdd}
            disabled={outOfStock || adding}
            style={{
              width: '100%', height: 36,
              background: outOfStock ? '#F1F5F9' : adding ? '#4CAF50' : inCart ? '#EEF2FF' : navy,
              color: outOfStock ? '#94A3B8' : adding ? '#fff' : inCart ? navy : '#fff',
              border: inCart && !adding ? `1.5px solid ${navy}` : 'none',
              borderRadius: 7, fontSize: 12, fontWeight: 700,
              cursor: outOfStock ? 'not-allowed' : 'pointer',
              fontFamily: 'Poppins, sans-serif', transition: 'all .2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              marginTop: 'auto',
            }}>
            {outOfStock ? 'Sin stock' : adding ? '✓ Agregado' : inCart ? '🛒 Actualizar' : '🛒 Agregar'}
          </button>
        </div>
      </div>
    </Link>
  )
}
