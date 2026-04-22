'use client'
// components/admin/layout/AdminLayout.tsx
// Layout principal del panel administrativo con sidebar y topbar
// Protegido por rol ADMIN o VENTAS (verificar en middleware.ts)

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

interface NavItem {
  href: string
  label: string
  icon: string
  roles: string[]
}

const NAV_ITEMS: NavItem[] = [
  { href: '/admin',           label: 'Dashboard',    icon: '▦',  roles: ['ADMIN', 'VENTAS'] },
  { href: '/admin/products',  label: 'Productos',    icon: '📦', roles: ['ADMIN', 'VENTAS'] },
  { href: '/admin/orders',    label: 'Órdenes',      icon: '📋', roles: ['ADMIN', 'VENTAS'] },
  { href: '/admin/quotes',    label: 'Cotizaciones', icon: '📄', roles: ['ADMIN', 'VENTAS'] },
  { href: '/admin/categories',label: 'Categorías',   icon: '🏷️', roles: ['ADMIN'] },
  { href: '/admin/users',     label: 'Usuarios',     icon: '👥', roles: ['ADMIN'] },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [user, setUser] = useState<{ name: string; role: string } | null>(null)

  useEffect(() => {
    // Cargar usuario del localStorage — en producción usar next-auth o cookies httpOnly
    const stored = localStorage.getItem('pl_user')
    if (!stored) { router.push('/admin/login'); return }
    setUser(JSON.parse(stored))
  }, [router])

  function handleLogout() {
    localStorage.removeItem('pl_token')
    localStorage.removeItem('pl_user')
    router.push('/admin/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F0F2F8', fontFamily: 'Inter, sans-serif' }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: sidebarOpen ? 240 : 64,
        background: '#1F3A93',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width .25s ease',
        flexShrink: 0,
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 50,
        overflowX: 'hidden',
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* REEMPLAZAR LOGO DE PROMESA LATINA AQUÍ */}
          <div style={{
            width: 32, height: 32, background: '#E65100',
            borderRadius: 8, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontWeight: 800, fontSize: 14,
            color: '#fff', flexShrink: 0,
          }}>PL</div>
          {sidebarOpen && (
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 13, fontFamily: 'Poppins, sans-serif', whiteSpace: 'nowrap' }}>
                Promesa Latina
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Panel Admin
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                title={!sidebarOpen ? item.label : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 12px',
                  borderRadius: 8,
                  marginBottom: 2,
                  textDecoration: 'none',
                  background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                  color: active ? '#fff' : 'rgba(255,255,255,0.65)',
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  transition: 'all .15s',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
              >
                <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                {sidebarOpen && item.label}
              </Link>
            )
          })}
        </nav>

        {/* User footer */}
        {user && (
          <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
              }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              {sidebarOpen && (
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ color: '#fff', fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10 }}>{user.role}</div>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.08)',
                border: 'none', borderRadius: 8, padding: '8px 12px',
                color: 'rgba(255,255,255,0.65)', fontSize: 12, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'all .15s',
              }}
            >
              <span>⎋</span>
              {sidebarOpen && 'Cerrar sesión'}
            </button>
          </div>
        )}
      </aside>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, marginLeft: sidebarOpen ? 240 : 64, transition: 'margin-left .25s ease', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* Topbar */}
        <header style={{
          background: '#fff',
          borderBottom: '1px solid #E2E8F0',
          padding: '0 24px',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}>
          <button
            onClick={() => setSidebarOpen(o => !o)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#64748B', padding: 4 }}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          <div style={{ flex: 1 }} />
          {/* Breadcrumb / page title se inyecta desde children */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link
              href="/"
              target="_blank"
              style={{ fontSize: 12, color: '#64748B', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <span>🌐</span> Ver sitio
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '24px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
