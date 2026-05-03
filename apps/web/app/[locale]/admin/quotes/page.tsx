'use client'
// app/admin/quotes/page.tsx
// Listado de cotizaciones para el equipo de ventas.
// Muestra todas las cotizaciones con estado, cliente, total y acciones.
// Además muestra las órdenes RECIBIDAS pendientes de cotizar.

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/admin/layout/AdminLayout'
import { getQuotes, deleteQuote, getPendingOrders } from '@/lib/api-quotes'
import type { Quote } from '@/types/quote'
import type { Order } from '@/types/order'
import { getClientInfo } from '@/types/quote'

const navy   = '#1F3A93'
const orange = '#E65100'

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function QuotesPage() {
  const router = useRouter()
  const [quotes,    setQuotes]    = useState<Quote[]>([])
  const [pending,   setPending]   = useState<Order[]>([])
  const [total,     setTotal]     = useState(0)
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [tab,       setTab]       = useState<'quotes' | 'pending'>('pending')
  const [actionId,  setActionId]  = useState<string | null>(null)
  const [toast,     setToast]     = useState<{ msg: string; ok: boolean } | null>(null)

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [qRes, pRes] = await Promise.all([
        getQuotes({ search: search || undefined, page: 1, limit: 50 }),
        getPendingOrders(),
      ])
      setQuotes(qRes.data)
      setTotal(qRes.total)
      setPending(pRes)
    } catch {
      showToast('Error al cargar datos', false)
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => { load() }, [load])

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta cotización?')) return
    setActionId(id)
    try {
      await deleteQuote(id)
      setQuotes(prev => prev.filter(q => q.id !== id))
      showToast('Cotización eliminada')
    } catch {
      showToast('Error al eliminar', false)
    } finally {
      setActionId(null)
    }
  }

  const tabStyle = (t: typeof tab): React.CSSProperties => ({
    padding: '8px 20px', border: 'none', cursor: 'pointer',
    fontSize: 13, fontWeight: 600, fontFamily: 'Inter, sans-serif',
    borderBottom: tab === t ? `2px solid ${navy}` : '2px solid transparent',
    color: tab === t ? navy : '#64748b',
    background: 'none', transition: 'all .15s',
  })

  return (
    <AdminLayout>
      {toast && (
        <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 999, background: toast.ok ? navy : '#ef4444', color: '#fff', padding: '12px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600 }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', fontFamily: 'Poppins, sans-serif', margin: 0 }}>Cotizaciones</h1>
          <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>
            {total} cotizaciones · <span style={{ color: pending.length > 0 ? orange : '#94a3b8', fontWeight: 600 }}>{pending.length} órdenes pendientes de cotizar</span>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: 20, background: '#fff', borderRadius: '12px 12px 0 0', overflow: 'hidden' }}>
        <button style={tabStyle('pending')} onClick={() => setTab('pending')}>
          📥 Órdenes por cotizar {pending.length > 0 && <span style={{ background: orange, color: '#fff', borderRadius: 10, padding: '1px 6px', fontSize: 10, marginLeft: 6 }}>{pending.length}</span>}
        </button>
        <button style={tabStyle('quotes')} onClick={() => setTab('quotes')}>
          📄 Cotizaciones enviadas
        </button>
      </div>

      {/* Buscador */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>🔍</span>
          <input
            type="text" placeholder={tab === 'pending' ? 'Buscar órdenes...' : 'Buscar cotizaciones...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', height: 38, paddingLeft: 34, border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif' }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 56, textAlign: 'center', color: '#94a3b8' }}>
          Cargando...
        </div>
      ) : tab === 'pending' ? (

        /* ── ÓRDENES PENDIENTES ─────────────────────────────────────────── */
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          {pending.length === 0 ? (
            <div style={{ padding: 56, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🎉</div>
              <p style={{ color: '#64748b', fontWeight: 600 }}>No hay órdenes pendientes de cotizar</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {['Orden', 'Cliente / Negocio', 'Productos', 'Total estimado', 'Fecha', 'Acción'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pending.filter(o =>
                  !search || [o.orderNumber, o.guestBusiness, o.guestName, o.guestEmail, o.user?.name, o.user?.businessName]
                    .some(v => v?.toLowerCase().includes(search.toLowerCase()))
                ).map(order => {
                  const biz = order.user?.businessName ?? order.guestBusiness ?? order.user?.name ?? order.guestName ?? '—'
                  const email = order.user?.email ?? order.guestEmail ?? '—'
                  return (
                    <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <code style={{ background: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                          #{order.orderNumber.slice(-8)}
                        </code>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <p style={{ fontWeight: 600, margin: 0 }}>{biz}</p>
                        <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>{email}</p>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontWeight: 700, color: navy }}>{order.items.length}</span>
                        <span style={{ color: '#94a3b8' }}> SKUs</span>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: navy }}>
                        ${fmt(order.total)}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>
                        {new Date(order.createdAt).toLocaleDateString('es-US')}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <Link
                          href={`/admin/quotes/new?orderId=${order.id}`}
                          style={{
                            background: orange, color: '#fff',
                            padding: '7px 16px', borderRadius: 7,
                            textDecoration: 'none', fontSize: 12, fontWeight: 700,
                            fontFamily: 'Poppins, sans-serif',
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                          }}
                        >
                          + Cotizar
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

      ) : (

        /* ── COTIZACIONES ENVIADAS ───────────────────────────────────────── */
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          {quotes.length === 0 ? (
            <div style={{ padding: 56, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>📄</div>
              <p style={{ color: '#64748b', fontWeight: 600 }}>No hay cotizaciones aún</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {['N.°', 'Cliente', 'Items', 'Total', 'Vigencia', 'Estado', 'Acciones'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {quotes.map(quote => {
                  const client    = getClientInfo(quote)
                  const expired   = new Date(quote.validUntil) < new Date()
                  const sent      = !!quote.sentAt
                  const statusBg  = sent ? '#dcfce7' : expired ? '#fee2e2' : '#fef3c7'
                  const statusClr = sent ? '#166534' : expired ? '#991b1b' : '#92400e'
                  const statusLbl = sent ? '✓ Enviada' : expired ? 'Vencida' : 'Borrador'
                  const busy      = actionId === quote.id
                  return (
                    <tr key={quote.id} style={{ borderBottom: '1px solid #f1f5f9', opacity: busy ? 0.5 : 1 }}>
                      <td style={{ padding: '12px 16px' }}>
                        <code style={{ fontSize: 11, background: '#f1f5f9', padding: '2px 6px', borderRadius: 3 }}>
                          {quote.quoteNumber.slice(-8)}
                        </code>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <p style={{ fontWeight: 600, margin: 0 }}>{client.businessName || client.name}</p>
                        <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>{client.email}</p>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#475569' }}>{quote.items.length} items</td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: navy, fontFamily: 'Poppins, sans-serif' }}>${fmt(quote.total)}</td>
                      <td style={{ padding: '12px 16px', color: expired ? '#ef4444' : '#64748b', fontSize: 12 }}>
                        {new Date(quote.validUntil).toLocaleDateString('es-US')}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: statusBg, color: statusClr, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                          {statusLbl}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button title="Ver detalle" onClick={() => router.push(`/admin/quotes/${quote.id}`)}
                            style={{ width: 30, height: 30, border: '1px solid #e2e8f0', borderRadius: 6, background: '#f8fafc', cursor: 'pointer', fontSize: 13 }}>
                            👁️
                          </button>
                          <button title="Eliminar" onClick={() => handleDelete(quote.id)} disabled={busy}
                            style={{ width: 30, height: 30, border: '1px solid #e2e8f0', borderRadius: 6, background: '#fef2f2', cursor: busy ? 'not-allowed' : 'pointer', fontSize: 13 }}>
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </AdminLayout>
  )
}
