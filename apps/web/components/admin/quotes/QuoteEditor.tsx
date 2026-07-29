'use client'
// components/admin/quotes/QuoteEditor.tsx
// Editor completo de cotización para el equipo de ventas.
// Recibe la orden original y permite:
//   - Validar precio de proveedor por item
//   - Ingresar precio de venta manual o por % margen
//   - Marcar disponibilidad y días de entrega
//   - Configurar % ganancia y % embotellado globales
//   - Ver totales en tiempo real
//   - Generar y enviar el PDF por correo

import { useState, useCallback, useEffect } from 'react'
import type { Order } from '@/types/order'
import type { QuoteFormData, QuoteItemForm } from '@/types/quote'

// ─── Colores y estilos reutilizables ─────────────────────────────────────────
const navy   = '#1F3A93'
const orange = '#E65100'
const green  = '#16a34a'
const red    = '#dc2626'

const inputStyle: React.CSSProperties = {
  height: 36, border: '1.5px solid #e2e8f0', borderRadius: 7,
  padding: '0 10px', fontSize: 13, color: '#1e293b',
  background: '#fafbfd', fontFamily: 'Inter, sans-serif',
  outline: 'none', width: '100%', transition: 'border-color .15s',
}

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: '#475569',
  letterSpacing: '0.05em', textTransform: 'uppercase',
  display: 'block', marginBottom: 5,
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  order: Order
  onSubmit: (data: QuoteFormData) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function QuoteEditor({ order, onSubmit, onCancel, isSubmitting }: Props) {
  // Inicializar items desde la orden
  const initItems = (): QuoteItemForm[] =>
    order.items.map(item => ({
      productId:    item.productId,
      productName:  item.product.name,
      productSku:   item.product.sku,
      quantity:     item.quantity,
      unitType:     item.unitType as 'caja' | 'paquete',
      supplierPrice: String(item.product.basePrice),
      bottlingCost:  (() => {
        const name = (item.product.name ?? '').toLowerCase()
        const sku  = (item.product.sku ?? '').toLowerCase()
        // Detectar bebidas por categoría o nombre
        const isBeverage =
                           name.includes('jugo') || name.includes('soda') ||
                           name.includes('bebida') || name.includes('nectar') ||
                           name.includes('refresco') || name.includes('suero') ||
                           name.includes('leche') || name.includes('energy') ||
                           name.includes('raptor') || name.includes('volt') ||
                           name.includes('adrenaline') || name.includes('lata') ||
                           name.includes('vidrio') || name.includes('tetra')
        if (!isBeverage) return 0
        const units = item.product.unitsPerCase ?? 1
        if (units <= 6)  return 0.60
        if (units <= 12) return 0.60
        if (units <= 24) return 1.20
        if (units >= 48) return 2.40
        return 0
      })(),
      salePrice: (() => {
        const base = item.product.basePrice || 0
        const name = (item.product.name ?? '').toLowerCase()
        const isBeverage =
                           name.includes('jugo') || name.includes('soda') ||
                           name.includes('bebida') || name.includes('nectar') ||
                           name.includes('refresco') || name.includes('suero') ||
                           name.includes('leche') || name.includes('energy') ||
                           name.includes('raptor') || name.includes('volt') ||
                           name.includes('adrenaline') || name.includes('lata') ||
                           name.includes('vidrio') || name.includes('tetra')
        const bot = (() => {
          if (!isBeverage) return 0
          const units = item.product.unitsPerCase ?? 1
          if (units <= 6)  return 0.60
          if (units <= 12) return 0.60
          if (units <= 24) return 1.20
          if (units >= 48) return 2.40
          return 0
        })()
        return base > 0 ? ((base + bot) * 1.40).toFixed(2) : ''
      })(),
      isAvailable:  true,
      deliveryDays: '5',
      notes:        '',
    }))

  const [items,          setItems]          = useState<QuoteItemForm[]>(initItems)
  const [profitPct,      setProfitPct]      = useState('40')
  const [bottlingPct,    setBottlingPct]    = useState('5')
  const [fees,           setFees]           = useState('0')
  const [validDays,      setValidDays]      = useState('7')
  const [globalNotes,    setGlobalNotes]    = useState('')
  const [priceMode,      setPriceMode]      = useState<'manual' | 'margin'>('margin')

  // Aplicar % de ganancia global a todos los items
  const applyGlobalMargin = useCallback(() => {
    const pct = parseFloat(profitPct) / 100 || 0
    setItems(prev => prev.map(item => {
      const base = parseFloat(item.supplierPrice) || 0
      const bot  = item.bottlingCost ?? 0
      const sale = (base + bot) * (1 + pct)
      return { ...item, salePrice: sale.toFixed(2) }
    }))
  }, [profitPct, bottlingPct])

  // Actualizar un campo de un item
  function updateItem(idx: number, field: keyof QuoteItemForm, value: string | boolean | number) {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  // Calcular precio de venta automático cuando cambia el precio proveedor
  function handleSupplierPriceChange(idx: number, val: string) {
    updateItem(idx, 'supplierPrice', val)
    if (priceMode === 'margin') {
      const base = parseFloat(val) || 0
      const pct  = parseFloat(profitPct) / 100 || 0
      const bot  = items[idx]?.bottlingCost ?? 0
      const sale = (base + bot) * (1 + pct)
      updateItem(idx, 'salePrice', sale.toFixed(2))
    }
  }

  // Totales
  const subtotal = items.reduce((acc, item) => {
    const sale = parseFloat(item.salePrice) || 0
    return acc + sale * item.quantity
  }, 0)
  const feesNum  = parseFloat(fees) || 0
  const total    = subtotal + feesNum

  const clientName     = order.user?.businessName ?? order.guestBusiness ?? order.user?.name ?? order.guestName ?? '—'
  const clientEmail    = order.user?.email        ?? order.guestEmail    ?? '—'
  const clientPhone    = order.user?.phone        ?? order.guestPhone    ?? '—'

  // Validar y enviar
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const missing = items.some(i => i.isAvailable && (!i.salePrice || parseFloat(i.salePrice) <= 0))
    if (missing) {
      alert('Todos los productos disponibles deben tener un precio de venta mayor a 0.')
      return
    }
    await onSubmit({
      orderId:         order.id,
      validDays,
      profitPercent:   profitPct,
      bottlingPercent: bottlingPct,
      fees,
      notes:           globalNotes,
      items,
    })
  }

  // ─── Mobile detection ───────────────────────────────────────────────────────
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} noValidate>
      <style>{`
        .quote-grid { display: grid; grid-template-columns: 1fr 340px; gap: 24px; align-items: start; }
        @media (max-width: 768px) { .quote-grid { grid-template-columns: 1fr; } }
      `}</style>
      <div className="quote-grid">

        {/* ── COLUMNA IZQUIERDA: Items ──────────────────────────────────────── */}
        <div>

          {/* Info del cliente */}
          <div style={{ background: '#f0f4ff', border: '1px solid #c7d2fe', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: navy, letterSpacing: '0.07em', margin: '0 0 10px', textTransform: 'uppercase' }}>
              Cliente / Negocio
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '4px 16px', fontSize: 13 }}>
              <div><span style={{ color: '#64748b' }}>Negocio:</span> <strong>{clientName}</strong></div>
              <div><span style={{ color: '#64748b' }}>Correo:</span> {clientEmail}</div>
              <div><span style={{ color: '#64748b' }}>Tel:</span> {clientPhone}</div>
              <div style={{ gridColumn: '1 / -1', marginTop: 4 }}>
                <span style={{ color: '#64748b' }}>Orden ref.:</span> <code style={{ fontSize: 11, background: '#e0e7ff', padding: '1px 6px', borderRadius: 3 }}>#{order.orderNumber}</code>
              </div>
            </div>
          </div>

          {/* Controles globales de precio */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 14 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.07em', margin: 0, textTransform: 'uppercase' }}>
                Configuración de precios
              </p>
              {/* Modo manual / margen */}
              <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 8, padding: 3, gap: 2 }}>
                {(['margin', 'manual'] as const).map(mode => (
                  <button key={mode} type="button"
                    onClick={() => setPriceMode(mode)}
                    style={{
                      padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                      fontSize: 12, fontWeight: 600, transition: 'all .15s',
                      background: priceMode === mode ? navy : 'transparent',
                      color: priceMode === mode ? '#fff' : '#64748b',
                    }}
                  >
                    {mode === 'margin' ? '% Margen automático' : 'Precio manual'}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 12, alignItems: 'end' }}>
              <div>
                <label style={labelStyle}>% Ganancia</label>
                <div style={{ position: 'relative' }}>
                  <input type="number" min="0" max="100" step="0.5"
                    value={profitPct}
                    onChange={e => {
                      setProfitPct(e.target.value)
                      if (priceMode === 'margin') {
                        const pct = parseFloat(e.target.value) / 100 || 0
                        const bot = parseFloat(bottlingPct) / 100 || 0
                        setItems(prev => prev.map(item => {
                          const base = parseFloat(item.supplierPrice) || 0
                          return { ...item, salePrice: base > 0 ? (base * (1 + pct + bot)).toFixed(2) : item.salePrice }
                        }))
                      }
                    }}
                    style={{ ...inputStyle, paddingRight: 28 }}
                  />
                  <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 13 }}>%</span>
                </div>
              </div>


              <button type="button" onClick={applyGlobalMargin}
                style={{
                  height: 36, background: navy, color: '#fff', border: 'none',
                  borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif', letterSpacing: '0.03em',
                  transition: 'background .15s',
                }}
              >
                ↺ Aplicar a todos
              </button>
            </div>
          </div>

          {/* Tabla de items */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflowX: 'auto' }}>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 80px 110px 110px 90px 70px 70px', gap: 8, padding: '10px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.05em', textTransform: 'uppercase', minWidth: 600 }}>
              <span>Producto</span>
              <span>Cant. / Tipo</span>
              <span>P. Proveedor</span>
              <span>P. Venta</span>
              <span>Subtotal</span>
              <span>Dispon.</span>
              <span>Días</span>
            </div>

            {items.map((item, idx) => {
              const supplier = parseFloat(item.supplierPrice) || 0
              const sale     = parseFloat(item.salePrice) || 0
              const sub      = sale * item.quantity
              const margin   = supplier > 0 ? ((sale - supplier) / supplier * 100) : 0

              return (
                <div key={item.productId} style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 80px 110px 110px 90px 70px 70px',
                  gap: 8, padding: '12px 16px',
                  borderBottom: idx < items.length - 1 ? '1px solid #f1f5f9' : 'none',
                  alignItems: 'center',
                  background: !item.isAvailable ? '#fff8f8' : 'transparent',
                }}>
                  {/* Producto */}
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 13, color: '#0f172a', margin: 0 }}>{item.productName}</p>
                    <p style={{ fontSize: 10, color: '#94a3b8', margin: '2px 0 0', fontFamily: 'monospace' }}>{item.productSku}</p>
                    <input
                      type="text"
                      placeholder="Nota interna (opcional)..."
                      value={item.notes}
                      onChange={e => updateItem(idx, 'notes', e.target.value)}
                      style={{ ...inputStyle, height: 28, fontSize: 11, marginTop: 6, color: '#64748b' }}
                    />
                  </div>

                  {/* Cantidad y tipo */}
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 700, color: navy, margin: '0 0 2px' }}>{item.quantity}</p>
                    <span style={{ fontSize: 10, background: '#e0e7ff', color: '#3730a3', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>
                      {item.unitType}
                    </span>
                  </div>

                  {/* Precio proveedor */}
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 12 }}>$</span>
                    <input type="number" min="0" step="0.01"
                      value={item.supplierPrice}
                      onChange={e => handleSupplierPriceChange(idx, e.target.value)}
                      style={{ ...inputStyle, paddingLeft: 20 }}
                    />
                  </div>

                  {/* Precio venta */}
                  <div>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 12 }}>$</span>
                      <input type="number" min="0" step="0.01"
                        value={item.salePrice}
                        onChange={e => updateItem(idx, 'salePrice', e.target.value)}
                        style={{
                          ...inputStyle, paddingLeft: 20,
                          borderColor: sale > 0 && sale > supplier ? '#86efac' : sale > 0 && sale < supplier ? '#fca5a5' : '#e2e8f0',
                        }}
                      />
                    </div>
                    {sale > 0 && supplier > 0 && (
                      <p style={{ fontSize: 10, margin: '3px 0 0', fontWeight: 600, color: margin >= 0 ? green : red }}>
                        {margin >= 0 ? '+' : ''}{margin.toFixed(1)}% margen
                      </p>
                    )}
                  </div>

                  {/* Subtotal */}
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: navy, margin: 0 }}>
                      ${fmt(sub)}
                    </p>
                  </div>

                  {/* Disponible toggle */}
                  <div style={{ textAlign: 'center' }}>
                    <label style={{ cursor: 'pointer', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                      <div style={{
                        width: 36, height: 20, borderRadius: 10,
                        background: item.isAvailable ? green : '#cbd5e1',
                        position: 'relative', transition: 'background .2s',
                      }}>
                        <div style={{
                          position: 'absolute', top: 2,
                          left: item.isAvailable ? 18 : 2,
                          width: 16, height: 16, borderRadius: '50%',
                          background: '#fff', transition: 'left .2s',
                        }} />
                      </div>
                      <input type="checkbox" checked={item.isAvailable}
                        onChange={e => updateItem(idx, 'isAvailable', e.target.checked)}
                        style={{ display: 'none' }}
                      />
                      <span style={{ fontSize: 9, color: item.isAvailable ? green : '#94a3b8', fontWeight: 700 }}>
                        {item.isAvailable ? 'SÍ' : 'NO'}
                      </span>
                    </label>
                  </div>

                  {/* Días entrega */}
                  <div>
                    <input type="number" min="1" max="90"
                      value={item.deliveryDays}
                      onChange={e => updateItem(idx, 'deliveryDays', e.target.value)}
                      style={{ ...inputStyle, textAlign: 'center' }}
                      title="Días estimados de entrega"
                    />
                    <p style={{ fontSize: 9, color: '#94a3b8', margin: '2px 0 0', textAlign: 'center' }}>días</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Notas globales */}
          <div style={{ marginTop: 16 }}>
            <label style={labelStyle}>Notas comerciales (aparecen en el PDF)</label>
            <textarea
              value={globalNotes}
              onChange={e => setGlobalNotes(e.target.value)}
              rows={3}
              placeholder="Condiciones especiales, instrucciones de entrega, descuentos acordados..."
              style={{
                width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 8,
                padding: '10px 12px', fontSize: 13, fontFamily: 'Inter, sans-serif',
                resize: 'vertical', outline: 'none', color: '#1e293b', background: '#fafbfd',
              }}
            />
          </div>
        </div>

        {/* ── COLUMNA DERECHA: Resumen y envío ─────────────────────────────── */}
        <div style={{ position: 'sticky', top: 80 }}>

          {/* Vigencia */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 20px', marginBottom: 16 }}>
            <label style={labelStyle}>Vigencia de la cotización</label>
            <select
              value={validDays}
              onChange={e => setValidDays(e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="3">3 días</option>
              <option value="5">5 días</option>
              <option value="7">7 días (recomendado)</option>
              <option value="10">10 días</option>
              <option value="15">15 días</option>
              <option value="30">30 días</option>
            </select>
            <p style={{ fontSize: 11, color: '#94a3b8', margin: '6px 0 0' }}>
              Vence: {new Date(Date.now() + parseInt(validDays) * 86400000).toLocaleDateString('es-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Resumen financiero */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '20px', marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.07em', textTransform: 'uppercase', margin: '0 0 14px' }}>
              Resumen cotización
            </p>

            {items.map(item => {
              const sale = parseFloat(item.salePrice) || 0
              const sub  = sale * item.quantity
              return (
                <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                  <span style={{ color: '#64748b', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.quantity}× {item.productName}
                  </span>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>
                    {sub > 0 ? `$${fmt(sub)}` : <span style={{ color: '#fca5a5' }}>Sin precio</span>}
                  </span>
                </div>
              )
            })}

            <div style={{ borderTop: '1px solid #f1f5f9', marginTop: 12, paddingTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>Subtotal</span>
                <span style={{ fontWeight: 600 }}>${fmt(subtotal)}</span>
              </div>
              {feesNum > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                  <span style={{ color: '#64748b' }}>Fees / Cargos</span>
                  <span style={{ fontWeight: 600 }}>${fmt(feesNum)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', background: navy, borderRadius: 8, padding: '10px 14px', marginTop: 8 }}>
                <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 700, fontSize: 14 }}>TOTAL</span>
                <span style={{ color: '#fbbf24', fontWeight: 800, fontSize: 18, fontFamily: 'Poppins, sans-serif' }}>
                  ${fmt(total)}
                </span>
              </div>
            </div>

            {/* Indicadores de margen */}
            <div style={{ marginTop: 12, padding: '10px 12px', background: '#f8fafc', borderRadius: 8, fontSize: 11 }}>
              <p style={{ fontWeight: 700, color: '#475569', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Análisis de margen</p>
              {(() => {
                const totalCost = items.reduce((acc, i) => acc + (parseFloat(i.supplierPrice) || 0) * i.quantity, 0)
                const totalSale = subtotal
                const margin = totalCost > 0 ? ((totalSale - totalCost) / totalCost * 100) : 0
                const profit = totalSale - totalCost
                return (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ color: '#64748b' }}>Costo total:</span>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>${fmt(totalCost)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ color: '#64748b' }}>Ganancia bruta:</span>
                      <span style={{ fontWeight: 700, color: profit >= 0 ? green : red }}>${fmt(profit)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Margen total:</span>
                      <span style={{ fontWeight: 700, color: margin >= 0 ? green : red }}>{margin.toFixed(1)}%</span>
                    </div>
                  </>
                )
              })()}
            </div>
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%', height: 44, background: isSubmitting ? '#94a3b8' : navy,
                color: '#fff', border: 'none', borderRadius: 8, fontSize: 14,
                fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontFamily: 'Poppins, sans-serif', letterSpacing: '0.03em',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'background .15s',
              }}
            >
              {isSubmitting
                ? <><span style={{ animation: 'spin .8s linear infinite', display: 'inline-block' }}>⟳</span> Guardando...</>
                : '💾 Guardar cotización'}
            </button>

            <button
              type="button"
              onClick={onCancel}
              style={{
                width: '100%', height: 36, background: '#fff', color: '#64748b',
                border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13,
                fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}
            >
              Cancelar
            </button>
          </div>

          <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 10 }}>
            El PDF se genera y envía al guardar y hacer clic en "Enviar cotización"
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </form>
  )
}
