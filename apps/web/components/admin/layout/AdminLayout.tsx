'use client'
// components/admin/layout/AdminLayout.tsx
// Layout principal del panel administrativo con sidebar responsive

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

interface NavItem { href: string; label: string; icon: string; roles: string[] }

const NAV_ITEMS: NavItem[] = [
  { href: '/admin/dashboard',   label: 'Dashboard',    icon: '▦',  roles: ['ADMIN', 'VENTAS'] },
  { href: '/admin/products',    label: 'Productos',    icon: '📦', roles: ['ADMIN', 'VENTAS'] },
  { href: '/admin/orders',      label: 'Órdenes',      icon: '📋', roles: ['ADMIN', 'VENTAS'] },
  { href: '/admin/quotes',      label: 'Cotizaciones', icon: '📄', roles: ['ADMIN', 'VENTAS'] },
  { href: '/admin/categories',  label: 'Categorías',   icon: '🏷️', roles: ['ADMIN'] },
  { href: '/admin/users',       label: 'Usuarios',     icon: '👥', roles: ['ADMIN'] },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname    = usePathname()
  const router      = useRouter()
  const locale      = useLocale()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile,    setIsMobile]    = useState(false)
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [user, setUser] = useState<{ name: string; role: string } | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('pl_user')
    if (!stored) { router.push(`/${locale}/admin/login`); return }
    setUser(JSON.parse(stored))
    const check = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) setSidebarOpen(false)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [router])

  function handleLogout() {
    localStorage.removeItem('pl_token')
    localStorage.removeItem('pl_user')
    router.push(`/${locale}/admin/login`)
  }

  function closeMobile() { setMobileOpen(false) }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <img src="https://res.cloudinary.com/db9s1q9zf/image/upload/v1778209449/LOGO_COLOR_b3ejfr.png" alt="Promesa Latina" style={{ height: 48, width: 48, objectFit: 'contain', flexShrink: 0 }} />
        {(sidebarOpen || isMobile) && (
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 13, fontFamily: 'Poppins, sans-serif', whiteSpace: 'nowrap' }}>Promesa Latina</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Panel Admin</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {NAV_ITEMS.map(item => {
          const active = pathname.includes(item.href)
          return (
            <Link key={item.href} href={`/${locale}${item.href}`} onClick={closeMobile}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', borderRadius: 8, marginBottom: 2, textDecoration: 'none', background: active ? 'rgba(255,255,255,0.15)' : 'transparent', color: active ? '#fff' : 'rgba(255,255,255,0.65)', fontSize: 14, fontWeight: active ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden' }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
              {(sidebarOpen || isMobile) && item.label}
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      {user && (
        <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', marginBottom: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            {(sidebarOpen || isMobile) && (
              <div style={{ overflow: 'hidden' }}>
                <div style={{ color: '#fff', fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10 }}>{user.role}</div>
              </div>
            )}
          </div>
          <button onClick={handleLogout} style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8, padding: '10px 12px', color: 'rgba(255,255,255,0.65)', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>⎋</span>
            {(sidebarOpen || isMobile) && 'Cerrar sesión'}
          </button>
        </div>
      )}
    </>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F0F2F8', fontFamily: 'Inter, sans-serif' }}>

      {/* Sidebar desktop */}
      {!isMobile && (
        <aside style={{ width: sidebarOpen ? 240 : 64, background: '#1F3A93', display: 'flex', flexDirection: 'column', transition: 'width .25s ease', flexShrink: 0, position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50, overflowX: 'hidden' }}>
          <SidebarContent />
        </aside>
      )}

      {/* Drawer mobile */}
      {isMobile && mobileOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200 }} onClick={closeMobile}>
          <aside style={{ position: 'absolute', top: 0, left: 0, width: 260, height: '100%', background: '#1F3A93', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }} onClick={e => e.stopPropagation()}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div style={{ flex: 1, marginLeft: isMobile ? 0 : (sidebarOpen ? 240 : 64), transition: 'margin-left .25s ease', display: 'flex', flexDirection: 'column', minHeight: '100vh', minWidth: 0 }}>

        {/* Topbar */}
        <header style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 40 }}>
          <button onClick={() => isMobile ? setMobileOpen(o => !o) : setSidebarOpen(o => !o)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#64748B', padding: 4, flexShrink: 0 }} aria-label="Toggle sidebar">
            ☰
          </button>
          <div style={{ flex: 1 }} />
          <Link href={`/${locale}`} target="_blank" style={{ fontSize: 12, color: '#64748B', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
            🌐 Ver sitio
          </Link>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: isMobile ? '16px' : '24px', minWidth: 0 }}>
          {children}
        </main>
      </div>
    </div>
  )
}
