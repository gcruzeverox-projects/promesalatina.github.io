'use client'
// apps/web/app/checkout/success/page.tsx
// Página de confirmación después de enviar una orden.

import { Suspense } from 'react'
import { useSearchParams , useParams} from 'next/navigation'
import Link from 'next/link'

const navy   = '#1F3A93'
const orange = '#E65100'

function SuccessContent() {
  const params = useParams()
  const locale = params.locale as string || 'es'
  const sp          = useSearchParams()
  const orderNumber = sp.get('order') ?? '—'

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #162b6e 0%, #1F3A93 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{
        background: '#fff', borderRadius: 20, padding: '48px 40px',
        maxWidth: 520, width: '100%', textAlign: 'center',
        boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
      }}>
        {/* Ícono animado */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'linear-gradient(135deg, #16a34a, #22c55e)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36, margin: '0 auto 24px',
          boxShadow: '0 8px 24px rgba(22,163,74,0.3)',
        }}>
          ✓
        </div>

        <h1 style={{
          fontFamily: 'Poppins, sans-serif', fontSize: 26, fontWeight: 800,
          color: '#0F172A', margin: '0 0 8px',
        }}>
          ¡Orden recibida!
        </h1>
        <p style={{ color: '#64748B', fontSize: 15, margin: '0 0 24px', lineHeight: 1.6 }}>
          Tu solicitud fue enviada exitosamente al equipo de Promesa Latina.
        </p>

        {/* Número de orden */}
        <div style={{
          background: '#F0F4FF', border: '1px solid #C7D2FE',
          borderRadius: 12, padding: '16px 20px', marginBottom: 24,
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#4338CA', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>
            Número de orden
          </p>
          <p style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 800, color: navy, margin: 0, wordBreak: 'break-all' }}>
            #{orderNumber}
          </p>
        </div>

        {/* Pasos siguientes */}
        <div style={{ textAlign: 'left', marginBottom: 28 }}>
          {[
            ['📧', 'Recibirás un correo de confirmación en los próximos minutos.'],
            ['📋', 'Nuestro equipo revisará tu orden y validará precios con el proveedor.'],
            ['💼', 'Recibirás una cotización formal por email en menos de 24 horas.'],
          ].map(([icon, text]) => (
            <div key={text} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
              <p style={{ fontSize: 13, color: '#475569', margin: 0, lineHeight: 1.6 }}>{text}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, flexDirection: 'column' }}>
          <Link href={`/${locale}/catalog`} style={{
            background: navy, color: '#fff', padding: '13px 0',
            borderRadius: 8, textDecoration: 'none', fontWeight: 700,
            fontSize: 14, display: 'block', fontFamily: 'Poppins, sans-serif',
          }}>
            Seguir comprando
          </Link>
          <Link href={`/${locale}`} style={{
            color: '#64748B', fontSize: 13, textDecoration: 'none',
            padding: '8px 0', display: 'block',
          }}>
            ← Volver al inicio
          </Link>
        </div>

        {/* REEMPLAZAR AQUÍ INFORMACIÓN DE CONTACTO DE PROMESA LATINA */}
        <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 20 }}>
          ¿Dudas? Escríbenos a{' '}
          <a href="mailto:ventas@promesalatina.com" style={{ color: navy }}>
            ventas@promesalatina.com
          </a>
        </p>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
        Cargando...
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
