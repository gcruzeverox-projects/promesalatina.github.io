'use client'
import { Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { AdminLayout } from '@/components/admin/layout/AdminLayout'
import { QuoteEditor } from '@/components/admin/quotes/QuoteEditor'
import { getOrder, createQuote, updateOrderStatus } from '@/lib/api-quotes'
import type { Order } from '@/types/order'
import type { QuoteFormData } from '@/types/quote'

function NewQuoteContent() {
  const sp      = useSearchParams()
  const router  = useRouter()
  const orderId = sp.get('orderId')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orderId) { setLoading(false); return }
    getOrder(orderId).then(setOrder).catch(() => setError('Orden no encontrada')).finally(() => setLoading(false))
  }, [orderId])

  async function handleSubmit(data: QuoteFormData) {
    setIsSubmitting(true)
    setError(null)
    try {
      const quote = await createQuote(data)
      if (orderId) await updateOrderStatus(orderId, 'COTIZANDO').catch(() => {})
      router.push(`/admin/quotes/${quote.id}?created=1`)
    } catch (e: any) {
      setError(e.message ?? 'Error al crear la cotización')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!orderId) return <div style={{ padding: 48, textAlign: 'center' }}><p style={{ color: '#EF4444' }}>No se especificó una orden.</p><Link href="/admin/quotes" style={{ color: '#1F3A93' }}>← Volver</Link></div>
  if (loading)  return <div style={{ padding: 56, textAlign: 'center', color: '#94A3B8' }}>Cargando orden...</div>
  if (!order)   return <div style={{ padding: 48, textAlign: 'center' }}><p style={{ color: '#EF4444' }}>Orden no encontrada.</p><Link href="/admin/quotes" style={{ color: '#1F3A93' }}>← Volver</Link></div>

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: 13, color: '#64748B' }}>
        <Link href="/admin/quotes" style={{ color: '#64748B', textDecoration: 'none' }}>Cotizaciones</Link>
        <span>›</span>
        <span style={{ color: '#0F172A', fontWeight: 600 }}>Nueva — Orden #{order.orderNumber.slice(-8)}</span>
      </div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, fontFamily: 'Poppins, sans-serif', color: '#0F172A', margin: 0 }}>Crear cotización</h1>
        <p style={{ color: '#64748B', fontSize: 13, margin: '4px 0 0' }}>Valida precios, ajusta márgenes y envía el PDF al cliente.</p>
      </div>
      {error && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#B91C1C', fontSize: 13 }}>⚠️ {error}</div>}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', padding: '28px 28px' }}>
        <QuoteEditor order={order} onSubmit={handleSubmit} onCancel={() => router.push('/admin/quotes')} isSubmitting={isSubmitting} />
      </div>
    </>
  )
}

export default function NewQuotePage() {
  return (
    <AdminLayout>
      <Suspense fallback={<div style={{ padding: 56, textAlign: 'center', color: '#94A3B8' }}>Cargando...</div>}>
        <NewQuoteContent />
      </Suspense>
    </AdminLayout>
  )
}
