'use client'
// apps/web/components/landing/Header.tsx
// Header de la landing — integrado con carrito B2B, sesión y cotizaciones.
// Versión final con todos los módulos comunicados.

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CartButton } from '@/components/cart/CartButton'

interface UserSession {
  name:  string
  role:  'ADMIN' | 'VENTAS' | 'CLIENTE'
  email: string
}

export function Header() {
  const [lang,     setLang]     = useState<'es' | 'en'>('es')
  const [session,  setSession]  = useState<UserSession | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('pl_user')
    if (stored) {
      try { setSession(JSON.parse(stored)) } catch { /* ignore */ }
    }
  }, [])

  function handleLogout() {
    localStorage.removeItem('pl_token')
    localStorage.removeItem('pl_user')
    setSession(null)
    setMenuOpen(false)
  }

  const isStaff = session?.role === 'ADMIN' || session?.role === 'VENTAS'

  const nav = {
    es: { products: 'Productos', about: 'Nosotros', contact: 'Contáctanos', catalog: 'Catálogo', orders: 'Mis Órdenes', quotes: 'Cotizaciones', admin: 'Panel Admin', login: 'Iniciar sesión' },
    en: { products: 'Products',  about: 'About',    contact: 'Contact',     catalog: 'Catalog',  orders: 'My Orders',   quotes: 'Quotes',       admin: 'Admin Panel',  login: 'Login' },
  }[lang]

  return (
    <header style={{
      background: '#1F3A93',
      padding: '0 24px',
      position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 4px 20px rgba(31,58,147,.25)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', height: 64, display: 'flex', alignItems: 'center', gap: 14 }}>

        {/* Logo — REEMPLAZAR LOGO DE PROMESA LATINA AQUÍ */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ width: 34, height: 34, background: '#E65100', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: '#fff' }}>PL</div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, fontFamily: 'Poppins, sans-serif', lineHeight: 1.1 }}>Promesa Latina</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 9, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Distribuidora B2B</div>
          </div>
        </Link>

        {/* Buscador */}
        <div style={{ flex: 1, maxWidth: 380, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)', fontSize: 16 }}>⌕</span>
          <input
            type="text"
            placeholder={lang === 'es' ? 'Buscar productos...' : 'Search products...'}
            style={{ width: '100%', height: 38, background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: 20, paddingLeft: 36, paddingRight: 14, fontSize: 13, color: '#fff', outline: 'none', fontFamily: 'Inter, sans-serif' }}
            onFocus={e => (e.target.style.background = 'rgba(255,255,255,0.2)')}
            onBlur={e => (e.target.style.background = 'rgba(255,255,255,0.12)')}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                window.location.href = `/catalog?search=${encodeURIComponent((e.target as HTMLInputElement).value)}`
              }
            }}
          />
        </div>

        {/* Nav pública */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Link href="/catalog" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: 13, fontWeight: 500, padding: '6px 10px', borderRadius: 6 }}>
            {nav.catalog}
          </Link>
          <Link href="/#about" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: 13, fontWeight: 500, padding: '6px 10px', borderRadius: 6 }}>
            {nav.about}
          </Link>
          <Link href="/#contact" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: 13, fontWeight: 500, padding: '6px 10px', borderRadius: 6 }}>
            {nav.contact}
          </Link>
        </nav>

        {/* Mis Órdenes (solo clientes autenticados) */}
        {session && session.role === 'CLIENTE' && (
          <Link href="/orders" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: 12, fontWeight: 600, padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', gap: 4 }}>
            📋 {nav.orders}
          </Link>
        )}

        {/* Accesos staff */}
        {isStaff && (
          <div style={{ display: 'flex', gap: 6 }}>
            <Link href="/admin/quotes" style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)', padding: '6px 12px', borderRadius: 7, textDecoration: 'none', fontSize: 12, fontWeight: 600, border: '1px solid rgba(255,255,255,0.2)' }}>
              📄 {nav.quotes}
            </Link>
            <Link href="/admin/products" style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#E65100', color: '#fff', padding: '6px 12px', borderRadius: 7, textDecoration: 'none', fontSize: 12, fontWeight: 700 }}>
              ⚙️ {nav.admin}
            </Link>
          </div>
        )}

        {/* Carrito */}
        <CartButton lang={lang} />

        {/* Selector idioma */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)' }}>
          {(['es', 'en'] as const).map(l => (
            <button key={l} onClick={() => setLang(l)} style={{ background: lang === l ? '#E65100' : 'none', border: 'none', color: lang === l ? '#fff' : 'rgba(255,255,255,0.65)', fontSize: 11, fontWeight: 700, padding: '5px 10px', cursor: 'pointer', letterSpacing: '0.05em' }}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Sesión */}
        {session ? (
          <div style={{ position: 'relative' }}>
            <button onClick={() => setMenuOpen(o => !o)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '4px 12px 4px 6px', cursor: 'pointer' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#E65100', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                {session.name.charAt(0).toUpperCase()}
              </div>
              <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>{session.name.split(' ')[0]}</span>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 }}>▾</span>
            </button>

            {menuOpen && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 6, background: '#fff', borderRadius: 10, border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: 180, overflow: 'hidden', zIndex: 200 }}>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid #F1F5F9' }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', margin: 0 }}>{session.name}</p>
                  <p style={{ fontSize: 11, color: '#94A3B8', margin: '2px 0 0' }}>{session.role}</p>
                </div>
                {session.role === 'CLIENTE' && (
                  <Link href="/orders" onClick={() => setMenuOpen(false)}
                    style={{ display: 'block', padding: '8px 14px', fontSize: 13, color: '#374151', textDecoration: 'none' }}>
                    📋 Mis Órdenes
                  </Link>
                )}
                {isStaff && (
                  <>
                    <Link href="/admin/products" onClick={() => setMenuOpen(false)}
                      style={{ display: 'block', padding: '8px 14px', fontSize: 13, color: '#374151', textDecoration: 'none' }}>
                      📦 Productos
                    </Link>
                    <Link href="/admin/orders" onClick={() => setMenuOpen(false)}
                      style={{ display: 'block', padding: '8px 14px', fontSize: 13, color: '#374151', textDecoration: 'none' }}>
                      📋 Órdenes
                    </Link>
                    <Link href="/admin/quotes" onClick={() => setMenuOpen(false)}
                      style={{ display: 'block', padding: '8px 14px', fontSize: 13, color: '#374151', textDecoration: 'none' }}>
                      📄 Cotizaciones
                    </Link>
                  </>
                )}
                <button onClick={handleLogout}
                  style={{ width: '100%', padding: '8px 14px', border: 'none', background: 'none', fontSize: 13, color: '#EF4444', cursor: 'pointer', textAlign: 'left', borderTop: '1px solid #F1F5F9' }}>
                  ⎋ Cerrar sesión
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/admin/login" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', padding: '6px 14px', borderRadius: 7, textDecoration: 'none', fontSize: 12, fontWeight: 600, border: '1px solid rgba(255,255,255,0.2)', flexShrink: 0 }}>
            {nav.login}
          </Link>
        )}
      </div>
    </header>
  )
}
