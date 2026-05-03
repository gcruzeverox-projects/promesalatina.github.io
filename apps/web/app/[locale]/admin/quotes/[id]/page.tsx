'use client'
// app/admin/quotes/[id]/page.tsx
// Pantalla de detalle de una cotización — ver, enviar PDF y editar.

import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { AdminLayout } from '@/components/admin/layout/AdminLayout'
import { QuoteDetail } from '@/components/admin/quotes/QuoteDetail'
import { QuoteEditor } from '@/components/admin/quotes/QuoteEditor'
import { getQuote, updateQuote, getOrder } from '@/lib/api-quotes'
import type { Quote, QuoteFormData } from '@/types/quote'
import type { Order } from '@/types/order'

export default function QuoteDetailPage() {
  const { id }     = useParams<{ id: string }>()
  const sp         = useSearchParams()
  const router     = useRouter()
  const justCreated = sp.get('created') === '1'

  const [quote,        setQuote]        = useState<Quote | null>(null)
  const [order,        setOrder]        = useState<Order | null>(null)
  const [loading,      setLoading]      = useState(true)
  const [editing,      setEditing]      = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error,        setError]        = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    getQuote(id)
      .then(async q => {
        setQuote(q)
        const o = await getOrder(q.orderId)
        setOrder(o)
      })
      .catch(() => setError('Cotización no encontrada'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleUpdate(data: QuoteFormData) {
    if (!quote) return
    setIsSubmitting(true)
    setError(null)
    try {
      const updated = await updateQuote(quote.id, data)
      setQuote(updated)
      setEditing(false)
    } catch (e: any) {
      setError(e.message ?? 'Error al actualizar')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) return <AdminLayout><div style={{ padding: 64, textAlign: 'center', color: '#94a3b8' }}>Cargando cotización...</div></AdminLayout>
  if (!quote || !order)  return <AdminLayout><div style={{ padding: 48, textAlign: 'center' }}><p style={{ color: '#ef4444' }}>No encontrada.</p><Link href="/admin/quotes" style={{ color: '#1F3A93', fontSize: 13 }}>← Volver</Link></div></AdminLayout>

  return (
    <AdminLayout>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: 13, color: '#64748b' }}>
        <Link href="/admin/quotes" style={{ color: '#64748b', textDecoration: 'none' }}>Cotizaciones</Link>
        <span>›</span>
        <span style={{ color: '#0f172a', fontWeight: 600 }}>#{quote.quoteNumber.slice(-8)}</span>
      </div>

      {/* Banner creación exitosa */}
      {justCreated && (
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#166534', display: 'flex', gap: 8, alignItems: 'center' }}>
          ✅ <strong>Cotización creada.</strong> Revisa los precios y haz clic en "Enviar cotización" para enviar el PDF al cliente.
        </div>
      )}

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#b91c1c', fontSize: 13 }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: '28px 28px' }}>
        {editing ? (
          <QuoteEditor
            order={order}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(false)}
            isSubmitting={isSubmitting}
          />
        ) : (
          <QuoteDetail
            quote={quote}
            onSent={setQuote}
            onEdit={() => setEditing(true)}
          />
        )}
      </div>
    </AdminLayout>
  )
}
