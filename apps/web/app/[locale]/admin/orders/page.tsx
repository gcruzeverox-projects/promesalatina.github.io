'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { AdminLayout } from '@/components/admin/layout/AdminLayout'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
const navy = '#1F3A93'

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  RECIBIDA:   { label: 'Recibida',   color: '#92400E', bg: '#FEF3C7' },
  ENVIADA:    { label: 'Enviada',    color: '#1E40AF', bg: '#DBEAFE' },
  PENDING:    { label: 'Pendiente',  color: '#92400E', bg: '#FEF3C7' },
  PROCESSING: { label: 'Procesando', color: '#1E40AF', bg: '#DBEAFE' },
  SHIPPED:    { label: 'Enviado',    color: '#7C3AED', bg: '#EDE9FE' },
  DELIVERED:  { label: 'Entregado',  color: '#166534', bg: '#DCFCE7' },
  CANCELLED:  { label: 'Cancelado',  color: '#991B1B', bg: '#FEE2E2' },
}

export default function OrdersPage() {
  const params = useParams()
  const locale = params.locale as string || 'es'
  const [orders,  setOrders]  = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')

  useEffect(() => {
    const token = localStorage.getItem('pl_token')
    if (!token) return
    fetch(`${BASE}/api/orders`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setOrders(data?.data ?? data ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = orders.filter(o => {
    if (!search) return true
    const q = search.toLowerCase()
    const client = (o.guestBusiness ?? o.guestName ?? o.user?.businessName ?? o.user?.name ?? '').toLowerCase()
    const orderNum = (o.orderNumber ?? o.id ?? '').toLowerCase()
    const date = new Date(o.createdAt).toLocaleDateString('es').toLowerCase()
    return client.includes(q) || orderNum.includes(q) || date.includes(q)
  })

  return (
    <AdminLayout>
      <div style={{ padding: 32, fontFamily: 'Inter, sans-serif' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Órdenes</h1>
          <p style={{ color: '#6B7280', margin: 0 }}>{filtered.length} de {orders.length} órdenes</p>
        </div>

        {/* Buscador */}
        <div style={{ marginBottom: 20 }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Buscar por cliente, número de orden o fecha..."
            style={{ width: '100%', height: 42, border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '0 14px', fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }}
          />
        </div>

        {loading ? <p>Cargando...</p> : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 12, border: '1px dashed #E5E7EB' }}>
            <div style={{ fontSize: 48 }}>📋</div>
            <p style={{ color: '#6B7280', marginTop: 16 }}>No se encontraron órdenes</p>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid #E5E7EB' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  {['#Orden', 'Cliente', 'Estado', 'Fecha'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order: any, i: number) => {
                  const st = STATUS_LABELS[order.status] ?? { label: order.status, color: '#374151', bg: '#F3F4F6' }
                  const client = order.guestBusiness ?? order.guestName ?? order.user?.businessName ?? order.user?.name ?? '—'
                  return (
                    <tr key={order.id} style={{ borderTop: i === 0 ? 'none' : '1px solid #F3F4F6' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#FAFBFF')}
                      onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
                      <td style={{ padding: '14px 16px' }}>
                        <Link href={`/${locale}/admin/quotes/new?orderId=${order.id}`}
                          style={{ color: navy, fontWeight: 600, fontSize: 13, textDecoration: 'none', fontFamily: 'monospace' }}>
                          #{order.orderNumber?.slice(-8) ?? order.id?.slice(-8)}
                        </Link>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 14, color: '#374151', fontWeight: 500 }}>{client}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ background: st.bg, color: st.color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                          {st.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: '#6B7280' }}>
                        {new Date(order.createdAt).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
