'use client'
// apps/web/app/orders/page.tsx
// Historial de órdenes del cliente autenticado.
// Muestra todas sus órdenes con estado y permite ver detalle.

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { fetchMyOrders } from '@/lib/api-catalog'
import { CartButton } from '@/components/cart/CartButton'
import { ORDER_STATUS_LABELS } from '@/types/order'

const navy = '#1F3A93'

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function OrdersPage() {
  const router   = useRouter()
  const [orders,  setOrders]  = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem('pl_user')
    if (!stored) { router.push('/admin/login'); return }
    setSession(JSON.parse(stored))

    fetchMyOrders()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [router])

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <header style={{ background: navy, padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', gap: 16, position: 'sticky', top: 0, zIndex: 100 }}>
        <Link href={`/${locale}`} style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 30, height: 30, background: '#E65100', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, color: '#fff' }}>PL</div>
          <span style={{ color: '#fff', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 13 }}>Promesa Latina</span>
        </Link>
        <Link href={`/${locale}/catalog`} style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, textDecoration: 'none' }}>Catálogo</Link>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
          <CartButton lang="es" />
        </div>
      </header>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Mis Órdenes
          </h1>
          {session && (
            <p style={{ color: '#64748B', fontSize: 13, margin: '4px 0 0' }}>
              {session.businessName ?? session.name} · {session.email}
            </p>
          )}
        </div>

        {loading ? (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0', padding: 56, textAlign: 'center', color: '#94A3B8' }}>
            Cargando órdenes...
          </div>
        ) : orders.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0', padding: '56px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>📋</div>
            <h3 style={{ fontFamily: 'Poppins, sans-serif', color: '#0F172A', margin: '0 0 8px' }}>
              Aún no tienes órdenes
            </h3>
            <p style={{ color: '#64748B', marginBottom: 20 }}>
              Explora el catálogo y solicita tu primera cotización
            </p>
            <Link href={`/${locale}/catalog`} style={{ background: navy, color: '#fff', padding: '12px 24px', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>
              Ver catálogo
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {orders.map(order => {
              const st = ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] ?? { label: order.status, color: '#475569', bg: '#F1F5F9' }
              return (
                <div key={order.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                  {/* Header de la tarjeta */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid #F1F5F9', flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <code style={{ background: '#EEF2FF', color: '#3730A3', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 700 }}>
                          #{order.orderNumber?.slice(-8) ?? order.id?.slice(-8)}
                        </code>
                        <span style={{ background: st.bg, color: st.color, fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20 }}>
                          {st.label}
                        </span>
                      </div>
                      <p style={{ color: '#94A3B8', fontSize: 12, margin: '4px 0 0' }}>
                        {new Date(order.createdAt).toLocaleDateString('es-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: 20, fontWeight: 800, color: navy, margin: 0 }}>
                        ${fmt(order.total)}
                      </p>
                      <p style={{ fontSize: 11, color: '#94A3B8', margin: 0 }}>
                        {order.items?.length ?? 0} producto(s)
                      </p>
                    </div>
                  </div>

                  {/* Items resumidos */}
                  <div style={{ padding: '12px 20px' }}>
                    {(order.items ?? []).slice(0, 3).map((item: any) => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#475569', marginBottom: 4 }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                          {item.product?.name ?? 'Producto'}
                        </span>
                        <span style={{ fontWeight: 600, flexShrink: 0 }}>
                          {item.quantity} {item.unitType}
                        </span>
                      </div>
                    ))}
                    {(order.items?.length ?? 0) > 3 && (
                      <p style={{ fontSize: 12, color: '#94A3B8', margin: '4px 0 0' }}>
                        +{order.items.length - 3} más...
                      </p>
                    )}
                  </div>

                  {/* Notas si las hay */}
                  {order.notes && (
                    <div style={{ padding: '0 20px 12px' }}>
                      <p style={{ fontSize: 12, color: '#64748B', background: '#FFF8E1', padding: '6px 10px', borderRadius: 6, margin: 0 }}>
                        📝 {order.notes}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Link href={`/${locale}/catalog`} style={{ color: '#64748B', fontSize: 13, textDecoration: 'none' }}>
            ← Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  )
}
