'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { AdminLayout } from '@/components/admin/layout/AdminLayout'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:    { label: 'Pendiente',  color: '#92400E', bg: '#FEF3C7' },
  PROCESSING: { label: 'Procesando', color: '#1E40AF', bg: '#DBEAFE' },
  SHIPPED:    { label: 'Enviado',    color: '#7C3AED', bg: '#EDE9FE' },
  DELIVERED:  { label: 'Entregado',  color: '#166534', bg: '#DCFCE7' },
  CANCELLED:  { label: 'Cancelado',  color: '#991B1B', bg: '#FEE2E2' },
}

export default function OrdersPage() {
  const params = useParams()
  const locale = params.locale as string || 'es'
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('pl_token')
    if (!token) return
    fetch(`${BASE}/api/orders`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setOrders(data?.data ?? data ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <AdminLayout>
      <div style={{ padding: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Órdenes</h1>
        <p style={{ color: '#6B7280', marginBottom: 32 }}>{orders.length} órdenes en total</p>
        {loading ? <p>Cargando...</p> : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 12 }}>
            <div style={{ fontSize: 48 }}>📋</div>
            <p style={{ color: '#6B7280', marginTop: 16 }}>No hay órdenes aún</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 12, overflow: 'hidden' }}>
            <thead>
              <tr style={{ background: '#F9FAFB' }}>
                {['#Orden', 'Cliente', 'Total', 'Estado', 'Fecha'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any) => {
                const s = STATUS_LABELS[order.status] ?? { label: order.status, color: '#374151', bg: '#F3F4F6' }
                return (
                  <tr key={order.id} style={{ borderTop: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: '#1F3A93' }}>#{order.orderNumber ?? order.id?.slice(0,8)}</td>
                    <td style={{ padding: '14px 16px', fontSize: 14, color: '#374151' }}>{order.user?.name ?? order.user?.email ?? '—'}</td>
                    <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: '#111827' }}>${order.total?.toFixed(2) ?? '0.00'}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ background: s.bg, color: s.color, padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{s.label}</span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#6B7280' }}>{new Date(order.createdAt).toLocaleDateString('es')}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  )
}
