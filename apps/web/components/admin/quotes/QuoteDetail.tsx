'use client'
// components/admin/quotes/QuoteDetail.tsx
// Vista de detalle de una cotización guardada.
// Muestra todos los datos y permite:
//   - Enviar PDF por email con un clic
//   - Descargar PDF localmente
//   - Ver estado de envío
//   - Volver al listado

import { useState } from 'react'
import type { Quote } from '@/types/quote'
import { getClientInfo } from '@/types/quote'
import { sendQuote, downloadQuotePdf } from '@/lib/api-quotes'

const navy   = '#1F3A93'
const orange = '#E65100'
const green  = '#16a34a'

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

interface Props {
  quote: Quote
  onSent: (updated: Quote) => void
  onEdit: () => void
}

export function QuoteDetail({ quote, onSent, onEdit }: Props) {
  const [sending,     setSending]     = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [toast,       setToast]       = useState<string | null>(null)

  const client   = getClientInfo(quote)
  const isExpired = new Date(quote.validUntil) < new Date()
  const isSent   = !!quote.sentAt

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  async function handleSend() {
    if (!confirm(`¿Enviar la cotización #${quote.quoteNumber} a ${client.email}?`)) return
    setSending(true)
    try {
      const result = await sendQuote(quote.id)
      onSent({ ...quote, pdfUrl: result.pdfUrl, sentAt: result.sentAt })
      showToast(`✓ Cotización enviada a ${client.email}`)
    } catch (e: any) {
      showToast(`⚠️ ${e.message}`)
    } finally {
      setSending(false)
    }
  }

  async function handleDownload() {
    setDownloading(true)
    try {
      const blob = await downloadQuotePdf(quote.id)
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `cotizacion-${quote.quoteNumber}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e: any) {
      showToast(`⚠️ ${e.message}`)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 16, right: 16, zIndex: 999,
          background: toast.startsWith('⚠️') ? '#ef4444' : navy,
          color: '#fff', padding: '12px 20px', borderRadius: 10,
          fontSize: 13, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        }}>
          {toast}
        </div>
      )}

      {/* Header de la cotización */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, fontFamily: 'Poppins, sans-serif', color: '#0f172a' }}>
              Cotización #{quote.quoteNumber}
            </h2>
            {isSent
              ? <span style={{ background: '#dcfce7', color: '#166534', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>✓ ENVIADA</span>
              : isExpired
                ? <span style={{ background: '#fee2e2', color: '#991b1b', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>VENCIDA</span>
                : <span style={{ background: '#fef3c7', color: '#92400e', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>BORRADOR</span>
            }
          </div>
          <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>
            Orden ref.: <code style={{ background: '#e0e7ff', padding: '1px 6px', borderRadius: 3, fontSize: 11 }}>#{quote.order.orderNumber}</code>
            {' · '}Creada: {new Date(quote.createdAt).toLocaleDateString('es-US')}
            {' · '}Vigente hasta: <strong style={{ color: isExpired ? '#ef4444' : '#1e293b' }}>{new Date(quote.validUntil).toLocaleDateString('es-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
          </p>
        </div>

        {/* Acciones */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={handleDownload}
            disabled={downloading}
            style={{
              padding: '9px 18px', border: '1.5px solid #e2e8f0', borderRadius: 8,
              background: '#fff', color: '#475569', fontSize: 13, fontWeight: 600,
              cursor: downloading ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {downloading ? '⟳ Descargando...' : '⬇️ Descargar PDF'}
          </button>

          <button
            onClick={onEdit}
            style={{
              padding: '9px 18px', border: '1.5px solid #e2e8f0', borderRadius: 8,
              background: '#fff', color: '#475569', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            ✏️ Editar
          </button>

          <button
            onClick={handleSend}
            disabled={sending || isExpired}
            style={{
              padding: '9px 22px', border: 'none', borderRadius: 8,
              background: sending || isExpired ? '#94a3b8' : orange,
              color: '#fff', fontSize: 13, fontWeight: 700,
              cursor: sending || isExpired ? 'not-allowed' : 'pointer',
              fontFamily: 'Poppins, sans-serif',
              display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: sending || isExpired ? 'none' : '0 4px 14px rgba(230,81,0,0.35)',
              transition: 'all .15s',
            }}
          >
            {sending ? '⟳ Enviando...' : isSent ? '📧 Reenviar PDF' : '📧 Enviar cotización'}
          </button>
        </div>
      </div>

      {/* Grid principal */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

        {/* Tabla de productos */}
        <div>
          {/* Info cliente */}
          <div style={{ background: '#f0f4ff', border: '1px solid #c7d2fe', borderRadius: 12, padding: '14px 18px', marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: navy, letterSpacing: '0.07em', margin: '0 0 8px', textTransform: 'uppercase' }}>Datos del cliente</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 20px', fontSize: 13 }}>
              {[
                ['Negocio', client.businessName || client.name],
                ['Contacto', client.name],
                ['Email', client.email],
                ['Teléfono', client.phone],
                ['Dirección', client.address],
              ].map(([label, val]) => val ? (
                <div key={label}>
                  <span style={{ color: '#64748b' }}>{label}: </span>
                  <strong>{val}</strong>
                </div>
              ) : null)}
            </div>
          </div>

          {/* Tabla de items */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {['Producto', 'SKU', 'Cant.', 'Dispon.', 'P. Venta', 'Entrega', 'Subtotal'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: h === 'Subtotal' || h === 'P. Venta' ? 'right' : 'left', fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {quote.items.map((item, i) => (
                  <tr key={item.id} style={{ borderBottom: i < quote.items.length - 1 ? '1px solid #f1f5f9' : 'none', background: !item.isAvailable ? '#fff8f8' : 'transparent' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <p style={{ fontWeight: 600, margin: 0 }}>{item.product.name}</p>
                      {item.notes && <p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 0' }}>{item.notes}</p>}
                    </td>
                    <td style={{ padding: '12px 14px' }}><code style={{ fontSize: 10, background: '#f1f5f9', padding: '1px 5px', borderRadius: 3 }}>{item.product.sku}</code></td>
                    <td style={{ padding: '12px 14px', fontWeight: 700 }}>{item.quantity} <span style={{ fontSize: 10, color: '#94a3b8' }}>{item.unitType}</span></td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: item.isAvailable ? '#dcfce7' : '#fee2e2', color: item.isAvailable ? '#166534' : '#991b1b' }}>
                        {item.isAvailable ? 'Sí' : 'No'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: navy }}>${fmt(item.salePrice)}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', color: '#64748b' }}>{item.deliveryDays ? `${item.deliveryDays}d` : '—'}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700 }}>${fmt(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Notas */}
          {quote.notes && (
            <div style={{ marginTop: 14, background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#92400e' }}>
              <strong>Notas comerciales:</strong> {quote.notes}
            </div>
          )}
        </div>

        {/* Resumen lateral */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.07em', textTransform: 'uppercase', margin: '0 0 14px' }}>Resumen financiero</p>

          {[
            ['% Ganancia',    `${quote.profitPercent}%`],
            ['% Embotellado', `${quote.bottlingPercent}%`],
            ['Subtotal',      `$${fmt(quote.subtotal)}`],
            ['Fees / Cargos', `$${fmt(quote.fees)}`],
          ].map(([label, val]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
              <span style={{ color: '#64748b' }}>{label}</span>
              <span style={{ fontWeight: 600 }}>{val}</span>
            </div>
          ))}

          <div style={{ background: navy, borderRadius: 8, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <span style={{ color: 'rgba(255,255,255,.85)', fontWeight: 700, fontSize: 14 }}>TOTAL</span>
            <span style={{ color: '#fbbf24', fontWeight: 800, fontSize: 22, fontFamily: 'Poppins, sans-serif' }}>${fmt(quote.total)}</span>
          </div>

          {/* Historial de envío */}
          {quote.sentAt && (
            <div style={{ marginTop: 14, padding: '10px 12px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, fontSize: 12 }}>
              <p style={{ fontWeight: 700, color: '#166534', margin: '0 0 4px' }}>✓ Enviado por email</p>
              <p style={{ color: '#16a34a', margin: 0 }}>{new Date(quote.sentAt).toLocaleString('es-US')}</p>
              <p style={{ color: '#16a34a', margin: '2px 0 0' }}>→ {client.email}</p>
            </div>
          )}

          {/* Link al PDF en Cloudinary */}
          {quote.pdfUrl && (
            <a href={quote.pdfUrl} target="_blank" rel="noopener noreferrer"
              style={{ display: 'block', textAlign: 'center', marginTop: 12, fontSize: 12, color: navy, textDecoration: 'none', fontWeight: 600 }}
            >
              📄 Ver PDF en línea →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
