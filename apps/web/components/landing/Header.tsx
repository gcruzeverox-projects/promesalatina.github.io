'use client'
// apps/web/components/landing/Header.tsx
// ACTUALIZADO: responsive mobile con menú hamburguesa

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

const getRoleConfig = (locale: string) => ({
  ADMIN:   { label: 'Panel Admin',  icon: '⚙️', href: `/${locale}/admin/products`, color: '#E65100' },
  VENTAS:  { label: 'Cotizaciones', icon: '📄', href: `/${locale}/admin/quotes`,   color: '#1F3A93' },
  CLIENTE: { label: 'Mis Órdenes', icon: '📋', href: `/${locale}/orders`,          color: '#1F3A93' },
})

export function Header() {
  const [lang,       setLang]       = useState<'es' | 'en'>('es')
  const [session,    setSession]    = useState<UserSession | null>(null)
  const [menuOpen,   setMenuOpen]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile,   setIsMobile]   = useState(false)
  const [mounted,    setMounted]    = useState(false)
  const locale = useLocale()

  useEffect(() => {
    setMounted(true)
    try {
      const stored = localStorage.getItem('pl_user')
      if (stored) setSession(JSON.parse(stored))
    } catch { /* ignore */ }
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  function handleLogout() {
    localStorage.removeItem('pl_token')
    localStorage.removeItem('pl_user')
    setSession(null)
    setMenuOpen(false)
    setMobileOpen(false)
  }

  const isStaff = session?.role === 'ADMIN' || session?.role === 'VENTAS'
  const roleConf = session ? getRoleConfig(locale)[session.role] : null
  const t = {
    es: { catalog: 'Catálogo', about: 'Nosotros', contact: 'Contacto', login: 'Iniciar sesión', logout: 'Cerrar sesión' },
    en: { catalog: 'Catalog',  about: 'About',    contact: 'Contact',  login: 'Sign in',        logout: 'Sign out' },
  }[lang]

  const navLinks = [
    { label: t.catalog, href: `/${locale}/catalog` },
    { label: t.about,   href: '/#about' },
    { label: t.contact, href: '/#contact' },
  ]

  return (
    <>
      <header style={{ background: '#1F3A93', padding: '0 16px', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 4px 20px rgba(31,58,147,.3)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', gap: 10 }}>

          {/* Logo */}
          <Link href={`/${locale}`} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ background: '#fff', borderRadius: '50%', padding: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.20)' }}><img src="https://res.cloudinary.com/db9s1q9zf/image/upload/LOGO_SIN_FONDO_ouvjnr.png" alt="Promesa Latina" style={{ height: isMobile ? 40 : 48, width: 'auto', objectFit: 'contain' }} /></div>
          </Link>

          {/* Spacer mobile para empujar carrito y hamburguesa a la derecha */}
          {isMobile && <div style={{ flex: 1 }} />}

          {isMobile && <div style={{ flex: 1 }} />}
          {/* Buscador desktop */}
          {!isMobile && (
            <div style={{ flex: 2, maxWidth: 480, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.45)', fontSize: 16, pointerEvents: 'none' }}>⌕</span>
              <input type="text" placeholder={lang === 'es' ? 'Buscar productos...' : 'Search products...'}
                style={{ width: '100%', height: 36, background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.18)', borderRadius: 20, paddingLeft: 36, paddingRight: 14, fontSize: 13, color: '#fff', outline: 'none', fontFamily: 'Inter, sans-serif' }}
                onFocus={e => { e.target.style.background = 'rgba(255,255,255,0.18)'; e.target.style.borderColor = 'rgba(255,255,255,0.45)' }}
                onBlur={e => { e.target.style.background = 'rgba(255,255,255,0.1)'; e.target.style.borderColor = 'rgba(255,255,255,0.18)' }}
                onKeyDown={e => { if (e.key === 'Enter') { const val = (e.target as HTMLInputElement).value.trim(); if (val) window.location.href = `/${locale}/catalog?search=${encodeURIComponent(val)}` } }}
              />
            </div>
          )}

          <div style={{ flex: '0 0 16px' }} />

          {/* Nav desktop */}
          {!isMobile && (
            <nav style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {navLinks.map(item => (
                <Link key={item.href} href={item.href} style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: 13, fontWeight: 500, padding: '6px 10px', borderRadius: 7, whiteSpace: 'nowrap' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = '#fff'; el.style.background = 'rgba(255,255,255,0.1)' }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = 'rgba(255,255,255,0.75)'; el.style.background = 'transparent' }}
                >{item.label}</Link>
              ))}
            </nav>
          )}

          {/* Carrito */}
          <CartButton lang={lang} />

          {/* Idioma desktop */}
          {!isMobile && (
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.18)', flexShrink: 0 }}>
              {(['es', 'en'] as const).map(l => (
                <button key={l} onClick={() => setLang(l)} style={{ background: lang === l ? '#E65100' : 'none', border: 'none', color: lang === l ? '#fff' : 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 700, padding: '5px 10px', cursor: 'pointer' }}>{l.toUpperCase()}</button>
              ))}
            </div>
          )}

          {/* Sesión desktop */}
          {!isMobile && mounted && (
            <>
              {session ? (
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <button onClick={() => setMenuOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.25)', borderRadius: 22, padding: '4px 14px 4px 5px', cursor: 'pointer' }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: roleConf?.color ?? '#E65100', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, fontFamily: 'Poppins, sans-serif', flexShrink: 0 }}>{session.name.charAt(0).toUpperCase()}</div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ color: '#fff', fontSize: 12, fontWeight: 700, lineHeight: 1.2 }}>{session.name.split(' ')[0]}</div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>{session.role}</div>
                    </div>
                    <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, marginLeft: 2 }}>▾</span>
                  </button>
                  {menuOpen && (
                    <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 12px 36px rgba(0,0,0,0.14)', minWidth: 210, overflow: 'hidden', zIndex: 200 }}>
                      <div style={{ padding: '14px 16px', borderBottom: '1px solid #F1F5F9', background: '#FAFBFD' }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: 0 }}>{session.name}</p>
                        <p style={{ fontSize: 11, color: '#94A3B8', margin: '2px 0 0' }}>{session.email}</p>
                      </div>
                      {roleConf && <Link href={roleConf.href} onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', fontSize: 13, fontWeight: 700, color: roleConf.color, textDecoration: 'none', borderBottom: '1px solid #F1F5F9' }}><span style={{ fontSize: 18 }}>{roleConf.icon}</span> Ir a {roleConf.label}</Link>}
                      {isStaff && (<><Link href={`/${locale}/admin/products`} onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '10px 16px', fontSize: 13, color: '#374151', textDecoration: 'none', borderBottom: '1px solid #F1F5F9' }}>📦 Productos</Link><Link href={`/${locale}/admin/orders`} onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '10px 16px', fontSize: 13, color: '#374151', textDecoration: 'none', borderBottom: '1px solid #F1F5F9' }}>📋 Órdenes</Link><Link href={`/${locale}/admin/quotes`} onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '10px 16px', fontSize: 13, color: '#374151', textDecoration: 'none', borderBottom: '1px solid #F1F5F9' }}>📄 Cotizaciones</Link></>)}
                      {session.role === 'CLIENTE' && <Link href={`/${locale}/catalog`} onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '10px 16px', fontSize: 13, color: '#374151', textDecoration: 'none', borderBottom: '1px solid #F1F5F9' }}>🛒 Catálogo</Link>}
                      <button onClick={handleLogout} style={{ width: '100%', padding: '10px 16px', border: 'none', background: 'none', fontSize: 13, color: '#EF4444', cursor: 'pointer', textAlign: 'left' }}>⎋ {t.logout}</button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href={`/${locale}/admin/login`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', color: '#1F3A93', padding: '8px 16px', borderRadius: 10, textDecoration: 'none', flexShrink: 0, fontWeight: 800, fontSize: 13, fontFamily: 'Poppins, sans-serif' }}>🔑 {t.login}</Link>
              )}
            </>
          )}

          {/* Hamburguesa mobile */}
          {isMobile && (
            <button onClick={() => setMobileOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, color: '#fff', fontSize: 24, flexShrink: 0, lineHeight: 1 }} aria-label="Menú">
              {mobileOpen ? '✕' : '☰'}
            </button>
          )}
        </div>

        {/* Buscador mobile */}
        {isMobile && (
          <div style={{ paddingBottom: 10 }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.45)', fontSize: 16, pointerEvents: 'none' }}>⌕</span>
              <input type="text" placeholder={lang === 'es' ? 'Buscar productos...' : 'Search products...'}
                style={{ width: '100%', height: 36, background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.18)', borderRadius: 20, paddingLeft: 36, paddingRight: 14, fontSize: 13, color: '#fff', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }}
                onKeyDown={e => { if (e.key === 'Enter') { const val = (e.target as HTMLInputElement).value.trim(); if (val) window.location.href = `/${locale}/catalog?search=${encodeURIComponent(val)}` } }}
              />
            </div>
          </div>
        )}
      </header>

      {/* Drawer mobile */}
      {isMobile && mobileOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200 }} onClick={() => setMobileOpen(false)}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '80%', maxWidth: 320, height: '100%', background: '#1F3A93', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ background: '#fff', borderRadius: '50%', padding: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.20)' }}><img src="https://res.cloudinary.com/db9s1q9zf/image/upload/LOGO_SIN_FONDO_ouvjnr.png" alt="Promesa Latina" style={{ height: 44, width: 'auto', objectFit: 'contain' }} /></div>
              <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer' }}>✕</button>
            </div>
            {navLinks.map(item => (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} style={{ color: '#fff', textDecoration: 'none', fontSize: 16, fontWeight: 600, padding: '14px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.08)', display: 'block', marginBottom: 4 }}>{item.label}</Link>
            ))}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.15)', margin: '12px 0' }} />
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              {(['es', 'en'] as const).map(l => (
                <button key={l} onClick={() => setLang(l)} style={{ flex: 1, background: lang === l ? '#E65100' : 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, padding: '10px', borderRadius: 8, cursor: 'pointer' }}>
                  {l === 'es' ? '🇲🇽 Español' : '🇺🇸 English'}
                </button>
              ))}
            </div>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.15)', margin: '8px 0' }} />
            {mounted && (
              <>
                {session ? (
                  <>
                    <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.1)', borderRadius: 10, marginBottom: 4 }}>
                      <p style={{ color: '#fff', fontWeight: 700, fontSize: 14, margin: '0 0 2px' }}>{session.name}</p>
                      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, margin: 0 }}>{session.email}</p>
                    </div>
                    {roleConf && <Link href={roleConf.href} onClick={() => setMobileOpen(false)} style={{ color: '#FFB74D', textDecoration: 'none', fontSize: 15, fontWeight: 700, padding: '14px 16px', background: 'rgba(255,255,255,0.08)', borderRadius: 10, display: 'block', marginBottom: 4 }}>{roleConf.icon} Ir a {roleConf.label}</Link>}
                    <button onClick={handleLogout} style={{ width: '100%', padding: '14px 16px', background: 'rgba(239,68,68,0.15)', border: 'none', color: '#FCA5A5', fontSize: 15, fontWeight: 600, borderRadius: 10, cursor: 'pointer', textAlign: 'left' }}>⎋ {t.logout}</button>
                  </>
                ) : (
                  <Link href={`/${locale}/admin/login`} onClick={() => setMobileOpen(false)} style={{ display: 'block', textAlign: 'center', background: '#fff', color: '#1F3A93', padding: '14px', borderRadius: 10, textDecoration: 'none', fontWeight: 800, fontSize: 15, fontFamily: 'Poppins, sans-serif' }}>🔑 {t.login}</Link>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
