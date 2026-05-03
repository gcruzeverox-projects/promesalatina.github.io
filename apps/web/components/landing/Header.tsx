'use client'
// apps/web/components/landing/Header.tsx
// ACTUALIZADO: botón de login prominente con indicador de rol después del acceso

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { CartButton } from '@/components/cart/CartButton'

interface UserSession {
  name:         string
  role:         'ADMIN' | 'VENTAS' | 'CLIENTE'
  email:        string
  businessName?: string
}

const ROLE_CONFIG = {
  ADMIN:   { label: 'Panel Admin',    icon: '⚙️', href: `/${locale}/admin/products`, color: '#E65100' },
  VENTAS:  { label: 'Cotizaciones',   icon: '📄', href: `/${locale}/admin/quotes`,   color: '#1F3A93' },
  CLIENTE: { label: 'Mis Órdenes',    icon: '📋', href: `/${locale}/orders`,         color: '#1F3A93' },
}

export function Header() {
  const [lang,     setLang]     = useState<'es' | 'en'>('es')
  const [session,  setSession]  = useState<UserSession | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const locale = useLocale()
  const [mounted,  setMounted]  = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const stored = localStorage.getItem('pl_user')
      if (stored) setSession(JSON.parse(stored))
    } catch { /* ignore */ }
  }, [])

  function handleLogout() {
    localStorage.removeItem('pl_token')
    localStorage.removeItem('pl_user')
    setSession(null)
    setMenuOpen(false)
  }

  const isStaff = session?.role === 'ADMIN' || session?.role === 'VENTAS'
  const roleConf = session ? ROLE_CONFIG[session.role] : null

  const t = {
    es: {
      catalog: 'Catálogo',
      about:   'Nosotros',
      contact: 'Contacto',
      login:   'Iniciar sesión',
      loginSub:'Vendedores · Admins · Clientes',
      logout:  'Cerrar sesión',
      orders:  'Mis Órdenes',
    },
    en: {
      catalog: 'Catalog',
      about:   'About',
      contact: 'Contact',
      login:   'Sign in',
      loginSub:'Sellers · Admins · Clients',
      logout:  'Sign out',
      orders:  'My Orders',
    },
  }[lang]

  return (
    <header style={{
      background: '#1F3A93',
      padding: '0 20px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 4px 20px rgba(31,58,147,.3)',
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>

        {/* ── Logo ── REEMPLAZAR LOGO DE PROMESA LATINA AQUÍ */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{
            width: 36, height: 36,
            background: '#E65100',
            borderRadius: 9,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 15, color: '#fff',
            fontFamily: 'Poppins, sans-serif',
            boxShadow: '0 2px 8px rgba(230,81,0,.4)',
          }}>PL</div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, fontFamily: 'Poppins, sans-serif' }}>
              Promesa Latina
            </div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Distribuidora B2B
            </div>
          </div>
        </Link>

        {/* ── Buscador ── */}
        <div style={{ flex: 1, maxWidth: 360, position: 'relative' }}>
          <span style={{
            position: 'absolute', left: 12, top: '50%',
            transform: 'translateY(-50%)',
            color: 'rgba(255,255,255,0.45)',
            fontSize: 16, pointerEvents: 'none',
          }}>⌕</span>
          <input
            type="text"
            placeholder={lang === 'es' ? 'Buscar productos...' : 'Search products...'}
            style={{
              width: '100%', height: 38,
              background: 'rgba(255,255,255,0.1)',
              border: '1.5px solid rgba(255,255,255,0.18)',
              borderRadius: 20,
              paddingLeft: 36, paddingRight: 14,
              fontSize: 13, color: '#fff',
              outline: 'none',
              fontFamily: 'Inter, sans-serif',
              transition: 'all .2s',
            }}
            onFocus={e => {
              e.target.style.background = 'rgba(255,255,255,0.18)'
              e.target.style.borderColor = 'rgba(255,255,255,0.45)'
            }}
            onBlur={e => {
              e.target.style.background = 'rgba(255,255,255,0.1)'
              e.target.style.borderColor = 'rgba(255,255,255,0.18)'
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                const val = (e.target as HTMLInputElement).value.trim()
                if (val) window.location.href = `/${locale}/catalog?search=${encodeURIComponent(val)}`
              }
            }}
          />
        </div>

        {/* ── Nav pública ── */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {[
            { label: t.catalog, href: `/${locale}/catalog` },
            { label: t.about,   href: '/#about'  },
            { label: t.contact, href: '/#contact' },
          ].map(item => (
            <Link key={item.href} href={item.href} style={{
              color: 'rgba(255,255,255,0.75)',
              textDecoration: 'none',
              fontSize: 13, fontWeight: 500,
              padding: '6px 10px',
              borderRadius: 7,
              transition: 'all .15s',
              whiteSpace: 'nowrap',
            }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.color = '#fff'
                el.style.background = 'rgba(255,255,255,0.1)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.color = 'rgba(255,255,255,0.75)'
                el.style.background = 'transparent'
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* ── Carrito ── */}
        <CartButton lang={lang} />

        {/* ── Selector idioma ── */}
        <div style={{
          display: 'flex',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: 20,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.18)',
          flexShrink: 0,
        }}>
          {(['es', 'en'] as const).map(l => (
            <button key={l} onClick={() => setLang(l)} style={{
              background: lang === l ? '#E65100' : 'none',
              border: 'none',
              color: lang === l ? '#fff' : 'rgba(255,255,255,0.6)',
              fontSize: 11, fontWeight: 700,
              padding: '5px 10px',
              cursor: 'pointer',
              letterSpacing: '0.05em',
              transition: 'all .15s',
            }}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        {/* ── ZONA DE SESIÓN ──────────────────────────────────────────── */}
        {mounted && (
          <>
            {session ? (
              /* ── Usuario autenticado ── */
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <button
                  onClick={() => setMenuOpen(o => !o)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 9,
                    background: 'rgba(255,255,255,0.12)',
                    border: '1.5px solid rgba(255,255,255,0.25)',
                    borderRadius: 22,
                    padding: '4px 14px 4px 5px',
                    cursor: 'pointer',
                    transition: 'all .15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
                >
                  {/* Avatar con inicial */}
                  <div style={{
                    width: 30, height: 30,
                    borderRadius: '50%',
                    background: roleConf?.color ?? '#E65100',
                    color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 800,
                    fontFamily: 'Poppins, sans-serif',
                    flexShrink: 0,
                  }}>
                    {session.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ color: '#fff', fontSize: 12, fontWeight: 700, lineHeight: 1.2 }}>
                      {session.name.split(' ')[0]}
                    </div>
                    <div style={{
                      fontSize: 9, fontWeight: 700,
                      color: roleConf?.color === '#E65100' ? '#FFB74D' : 'rgba(255,255,255,0.55)',
                      letterSpacing: '0.07em',
                      textTransform: 'uppercase',
                    }}>
                      {session.role}
                    </div>
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, marginLeft: 2 }}>▾</span>
                </button>

                {/* Menú desplegable */}
                {menuOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    background: '#fff',
                    borderRadius: 12,
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 12px 36px rgba(0,0,0,0.14)',
                    minWidth: 210,
                    overflow: 'hidden',
                    zIndex: 200,
                  }}>
                    {/* Info usuario */}
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid #F1F5F9', background: '#FAFBFD' }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: 0 }}>{session.name}</p>
                      <p style={{ fontSize: 11, color: '#94A3B8', margin: '2px 0 0' }}>{session.email}</p>
                      <span style={{
                        display: 'inline-block', marginTop: 6,
                        background: roleConf?.color === '#E65100' ? '#FFF3E0' : '#EEF2FF',
                        color: roleConf?.color,
                        fontSize: 10, fontWeight: 800,
                        padding: '2px 8px', borderRadius: 4,
                        letterSpacing: '0.06em', textTransform: 'uppercase',
                      }}>
                        {roleConf?.icon} {session.role}
                      </span>
                    </div>

                    {/* Acceso directo según rol */}
                    {roleConf && (
                      <Link href={roleConf.href}
                        onClick={() => setMenuOpen(false)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '12px 16px',
                          fontSize: 13, fontWeight: 700,
                          color: roleConf.color,
                          textDecoration: 'none',
                          borderBottom: '1px solid #F1F5F9',
                          background: '#F8FAFC',
                          transition: 'background .15s',
                        }}
                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#F0F4FF')}
                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '#F8FAFC')}
                      >
                        <span style={{ fontSize: 18 }}>{roleConf.icon}</span>
                        Ir a {roleConf.label}
                      </Link>
                    )}

                    {/* Links adicionales por rol */}
                    {session.role === 'CLIENTE' && (
                      <Link href={`/${locale}/catalog`} onClick={() => setMenuOpen(false)}
                        style={{ display: 'block', padding: '10px 16px', fontSize: 13, color: '#374151', textDecoration: 'none', borderBottom: '1px solid #F1F5F9' }}>
                        🛒 Catálogo
                      </Link>
                    )}
                    {isStaff && (
                      <>
                        <Link href={`/${locale}/admin/products`} onClick={() => setMenuOpen(false)}
                          style={{ display: 'block', padding: '10px 16px', fontSize: 13, color: '#374151', textDecoration: 'none', borderBottom: '1px solid #F1F5F9' }}>
                          📦 Productos
                        </Link>
                        <Link href={`/${locale}/admin/orders`} onClick={() => setMenuOpen(false)}
                          style={{ display: 'block', padding: '10px 16px', fontSize: 13, color: '#374151', textDecoration: 'none', borderBottom: '1px solid #F1F5F9' }}>
                          📋 Órdenes
                        </Link>
                        <Link href={`/${locale}/admin/quotes`} onClick={() => setMenuOpen(false)}
                          style={{ display: 'block', padding: '10px 16px', fontSize: 13, color: '#374151', textDecoration: 'none', borderBottom: '1px solid #F1F5F9' }}>
                          📄 Cotizaciones
                        </Link>
                      </>
                    )}

                    {/* Logout */}
                    <button onClick={handleLogout} style={{
                      width: '100%', padding: '10px 16px',
                      border: 'none', background: 'none',
                      fontSize: 13, color: '#EF4444',
                      cursor: 'pointer', textAlign: 'left',
                      display: 'flex', alignItems: 'center', gap: 8,
                      transition: 'background .15s',
                    }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#FEF2F2')}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'none')}
                    >
                      ⎋ {t.logout}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* ── BOTÓN LOGIN PROMINENTE (sin sesión) ── */
              <Link
                href={`/${locale}/admin/login`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#fff',
                  color: '#1F3A93',
                  padding: '7px 18px',
                  borderRadius: 10,
                  textDecoration: 'none',
                  flexShrink: 0,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
                  transition: 'all .2s',
                  lineHeight: 1.2,
                  minWidth: 120,
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.background = '#F0F4FF'
                  el.style.transform = 'translateY(-1px)'
                  el.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.background = '#fff'
                  el.style.transform = 'translateY(0)'
                  el.style.boxShadow = '0 2px 12px rgba(0,0,0,0.15)'
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 800, fontFamily: 'Poppins, sans-serif' }}>
                  🔑 {t.login}
                </span>
                <span style={{ fontSize: 9, color: '#94A3B8', letterSpacing: '0.04em', marginTop: 1 }}>
                  {t.loginSub}
                </span>
              </Link>
            )}
          </>
        )}
      </div>
    </header>
  )
}
