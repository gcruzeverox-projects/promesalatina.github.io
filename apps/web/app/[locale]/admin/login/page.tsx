'use client'
// apps/web/app/admin/login/page.tsx
// Página de login del panel administrativo

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export default function AdminLoginPage() {
  const params = useParams()
  const locale = params.locale as string || 'es'
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res  = await fetch(`${BASE}/api/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? 'Credenciales incorrectas')

      localStorage.setItem('pl_token', data.access_token)
      localStorage.setItem('pl_user',  JSON.stringify(data.user))

      // Redirigir según rol
      if (data.user.role === 'ADMIN')  router.push(`/${locale}/admin/products`)
      else if (data.user.role === 'VENTAS') router.push(`/${locale}/admin/quotes`)
      else router.push(`/${locale}`)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const inp: React.CSSProperties = {
    width: '100%', height: 44, border: '1.5px solid #e2e8f0',
    borderRadius: 8, padding: '0 14px', fontSize: 14,
    outline: 'none', fontFamily: 'Inter, sans-serif', color: '#1e293b',
    background: '#fafbfd',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#162b6e,#1F3A93)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '40px 36px', width: '100%', maxWidth: 400, boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img
            src="https://res.cloudinary.com/db9s1q9zf/image/upload/LOGO_SIN_FONDO_ouvjnr.png"
            alt="Promesa Latina"
            style={{ height: 80, width: 'auto', objectFit: 'contain', marginBottom: 12 }}
          />
          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0 }}>Promesa Latina</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, letterSpacing: '0.03em' }}>Correo electrónico</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="admin@promesalatina.com" style={inp}
              onFocus={e => (e.target.style.borderColor = '#1F3A93')}
              onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, letterSpacing: '0.03em' }}>Contraseña</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" style={inp}
              onFocus={e => (e.target.style.borderColor = '#1F3A93')}
              onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
            />
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#b91c1c', fontSize: 13 }}>
              ⚠️ {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', height: 44, background: loading ? '#94a3b8' : '#1F3A93',
            color: '#fff', border: 'none', borderRadius: 8, fontSize: 14,
            fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'Poppins, sans-serif', transition: 'background .15s',
          }}>
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión →'}
          </button>
        </form>



        <p style={{ textAlign: 'center', marginTop: 20 }}>
          <a href={`/${locale}`} style={{ color: '#64748b', fontSize: 12, textDecoration: 'none' }}>← Volver al sitio</a>
        </p>
      </div>
    </div>
  )
}
