'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { AdminLayout } from '@/components/admin/layout/AdminLayout'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export default function DashboardPage() {
  const params = useParams()
  const locale = params.locale as string || 'es'
  const [stats, setStats] = useState({
    products: 0, orders: 0, quotes: 0, revenue: 0
  })

  useEffect(() => {
    const token = localStorage.getItem('pl_token')
    if (!token) return
    const headers = { Authorization: `Bearer ${token}` }
    Promise.all([
      fetch(`${BASE}/api/products`, { headers }).then(r => r.json()),
      fetch(`${BASE}/api/orders`, { headers }).then(r => r.json()),
      fetch(`${BASE}/api/quotes`, { headers }).then(r => r.json()),
    ]).then(([products, orders, quotes]) => {
      setStats({
        products: products?.total ?? products?.length ?? 0,
        orders: orders?.total ?? orders?.length ?? 0,
        quotes: quotes?.total ?? quotes?.length ?? 0,
        revenue: quotes?.data?.reduce((s: number, q: any) => s + (q.total ?? 0), 0) ?? quotes?.reduce((s: number, q: any) => s + (q.total ?? 0), 0) ?? 0,
      })
    }).catch(() => {})
  }, [])

  const cards = [
    { label: 'Productos activos', value: stats.products, icon: '📦', color: '#1F3A93' },
    { label: 'Órdenes totales',   value: stats.orders,   icon: '📋', color: '#E65100' },
    { label: 'Cotizaciones',      value: stats.quotes,   icon: '📄', color: '#7C3AED' },
    { label: 'Total cotizado',  value: `$${stats.revenue.toLocaleString()}`, icon: '💰', color: '#059669' },
  ]

  return (
    <AdminLayout>
      <div style={{ padding: '32px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Dashboard</h1>
        <p style={{ color: '#6B7280', marginBottom: 32 }}>Resumen general de Distribuidora Promesa Latina</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
          {cards.map(card => (
            <div key={card.label} style={{
              background: '#fff', borderRadius: 12, padding: '24px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)', borderTop: `4px solid ${card.color}`
            }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{card.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: card.color }}>{card.value}</div>
              <div style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>{card.label}</div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
