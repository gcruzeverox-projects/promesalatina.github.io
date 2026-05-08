'use client'
// app/checkout/page.tsx
// Checkout B2B completo con formulario de cliente y resumen de orden.
// Soporta cliente invitado y cliente autenticado.

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useCartStore } from '@/store/cart'
import { submitOrder }  from '@/lib/api-catalog'

const navy   = '#1F3A93'
const orange = '#E65100'

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const inp: React.CSSProperties = {
  width: '100%', height: 42, border: '1.5px solid #E2E8F0', borderRadius: 8,
  padding: '0 14px', fontSize: 14, color: '#1E293B', background: '#FAFBFD',
  outline: 'none', fontFamily: 'Inter, sans-serif', transition: 'border-color .15s',
}

function CheckoutContent() {
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string || 'es'
  const { items, subtotal, checkoutNotes, setNotes, clearCart } = useCartStore()

  const [form, setForm] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pl_checkout_form')
      if (saved) return JSON.parse(saved)
    }
    return { name: '', email: '', phone: '', business: '', address: '', city: '', state: '' }
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted,  setSubmitted]  = useState(false)
  const [error,      setError]      = useState<string | null>(null)
  const [session,    setSession]    = useState<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem('pl_user')
    if (stored) {
      const user = JSON.parse(stored)
      setSession(user)
      setForm(f => ({
        ...f,
        name:     user.name     ?? '',
        email:    user.email    ?? '',
        phone:    user.phone    ?? '',
        business: user.businessName ?? '',
        address:  user.address  ?? '',
      }))
    }
  }, [])

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm(prev => {
        const updated = { ...prev, [field]: e.target.value }
        localStorage.setItem('pl_checkout_form', JSON.stringify(updated))
        return updated
      })
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (items.length === 0) return
    setSubmitting(true)
    setError(null)

    try {
      const payload = {
        guestName:     form.name,
        guestEmail:    form.email,
        guestPhone:    form.phone,
        guestBusiness: form.business,
        guestAddress:  `${form.address}${form.city ? ', ' + form.city : ''}${form.state ? ', ' + form.state : ''}`,
        userId:        session?.id,
        notes:         checkoutNotes,
        items: items.map(item => ({
          productId: item.productId,
          quantity:  item.quantity,
          unitType:  item.unitType,
          unitPrice: item.basePrice,
        })),
      }
      const order = await submitOrder(payload)
      setSubmitted(true)
      clearCart()
      localStorage.removeItem('pl_checkout_form')
      router.push(`/${locale}/checkout/success?order=${order.orderNumber}`)
    } catch (e: any) {
      setError(e.message ?? 'Error al enviar la orden')
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0 && !submitted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🛒</div>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', color: '#0F172A', margin: '0 0 8px' }}>Tu carrito está vacío</h2>
          <p style={{ color: '#64748B', marginBottom: 20 }}>Agrega productos antes de continuar</p>
          <Link href={`/${locale}/catalog`} style={{ background: navy, color: '#fff', padding: '12px 24px', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>Ver catálogo</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <header style={{ background: navy, padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href={`/${locale}/catalog`} style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 13 }}>← Catálogo</Link>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
        <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>Solicitar Cotización B2B</h1>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>

        {/* ── Formulario ────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit}>

          {/* Info negocio */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', padding: '24px 28px', marginBottom: 20 }}>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 16, fontWeight: 700, color: '#0F172A', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
              🏪 Datos de tu negocio
            </h2>
            {session && (
              <div style={{ background: '#F0F4FF', border: '1px solid #C7D2FE', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#3730A3' }}>
                ✓ Sesión iniciada como <strong>{session.name}</strong> ({session.email})
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              {[
                ['name',     'Nombre de contacto *',     'Ana García',             true],
                ['business', 'Nombre del negocio *',     'La Tiendita Latina',     true],
                ['email',    'Correo electrónico *',      'ana@tiendita.com',       true],
                ['phone',    'Teléfono *',                '+1 (213) 555-0100',      true],
                ['address',  'Dirección de entrega',      '1234 E Cesar Chavez Ave', false],
                ['city',     'Ciudad',                    'Los Angeles',            false],
              ].map(([field, label, placeholder, required]) => (
                <div key={field as string} style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, letterSpacing: '0.03em' }}>
                    {label as string}
                  </label>
                  <input
                    type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                    required={required as boolean}
                    value={(form as any)[field as string]}
                    onChange={set(field as string)}
                    placeholder={placeholder as string}
                    style={inp}
                    onFocus={e => (e.target.style.borderColor = navy)}
                    onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Notas */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', padding: '24px 28px', marginBottom: 20 }}>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 16, fontWeight: 700, color: '#0F172A', margin: '0 0 16px' }}>
              📝 Notas adicionales
            </h2>
            <textarea
              value={checkoutNotes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Instrucciones especiales de entrega, horarios preferidos, productos urgentes..."
              style={{ ...inp, height: 'auto', padding: '10px 14px', resize: 'vertical' }}
            />
          </div>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 16px', marginBottom: 16, color: '#B91C1C', fontSize: 13 }}>
              ⚠️ {error}
            </div>
          )}

          <button type="submit" disabled={submitting}
            style={{ width: '100%', height: 50, background: submitting ? '#94A3B8' : orange, color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 800, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'Poppins, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {submitting ? '⟳ Enviando orden...' : '✅ Confirmar y solicitar cotización'}
          </button>
          <p style={{ textAlign: 'center', color: '#94A3B8', fontSize: 12, marginTop: 10 }}>
            Recibirás una cotización formal por email en menos de 24 horas
          </p>
        </form>

        {/* ── Resumen de orden ───────────────────────────────────────────── */}
        <div style={{ position: 'sticky', top: 80 }}>
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
            <div style={{ background: navy, padding: '14px 20px' }}>
              <h3 style={{ color: '#fff', fontFamily: 'Poppins, sans-serif', fontSize: 14, fontWeight: 700, margin: 0 }}>
                Resumen de tu orden ({items.length} productos)
              </h3>
            </div>

            <div style={{ maxHeight: 380, overflowY: 'auto' }}>
              {items.map(item => (
                <div key={item.productId} style={{ display: 'flex', gap: 10, padding: '12px 16px', borderBottom: '1px solid #F1F5F9', alignItems: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 6, background: '#F1F5F9', flexShrink: 0, overflow: 'hidden' }}>
                    {item.imageUrl
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📦</div>
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: 12, margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                    <p style={{ fontSize: 10, color: '#94A3B8', margin: 0 }}>{item.quantity} {item.unitType}(s)</p>
                  </div>
                  <p style={{ fontWeight: 700, fontSize: 13, color: navy, margin: 0, flexShrink: 0 }}>
                    ${fmt(item.basePrice * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ padding: '16px 20px', background: '#FAFBFD' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: '#64748B', fontSize: 13 }}>Subtotal estimado</span>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#0F172A' }}>${fmt(subtotal())}</span>
              </div>
              <div style={{ background: navy, borderRadius: 8, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 700 }}>Total orden</span>
                <span style={{ color: '#FFB74D', fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 20 }}>${fmt(subtotal())}</span>
              </div>
              <p style={{ fontSize: 10, color: '#94A3B8', textAlign: 'center', marginTop: 8 }}>
                * El precio final se confirma en la cotización oficial
              </p>
            </div>
          </div>

          <Link href={`/${locale}/catalog`} style={{ display: 'block', textAlign: 'center', marginTop: 12, color: '#64748B', fontSize: 12, textDecoration: 'none' }}>
            ← Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div style={{ padding: 64, textAlign: 'center', color: '#94A3B8' }}>Cargando...</div>}>
      <CheckoutContent />
    </Suspense>
  )
}
