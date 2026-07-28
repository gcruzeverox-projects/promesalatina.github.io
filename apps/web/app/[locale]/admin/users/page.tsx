'use client'
import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/layout/AdminLayout'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

const ROLE_COLORS: Record<string, { color: string; bg: string; label: string }> = {
  ADMIN:   { color: '#991B1B', bg: '#FEE2E2', label: 'Admin' },
  VENTAS:  { color: '#1E40AF', bg: '#DBEAFE', label: 'Ventas' },
  CLIENTE: { color: '#166534', bg: '#DCFCE7', label: 'Cliente' },
}

export default function UsersPage() {
  const [users,   setUsers]   = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')

  useEffect(() => {
    const token = localStorage.getItem('pl_token')
    if (!token) { setLoading(false); return }
    fetch(`${BASE}/api/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setUsers(Array.isArray(data) ? data : data.data ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.businessName?.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter
    return matchSearch && matchRole
  })

  const navy = '#1F3A93'

  return (
    <AdminLayout>
      <div style={{ padding: 32, fontFamily: 'Inter, sans-serif' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Usuarios</h1>
            <p style={{ color: '#6B7280', margin: 0 }}>{filtered.length} de {users.length} usuarios</p>
          </div>
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Buscar por nombre, email o negocio..."
            style={{ flex: 1, minWidth: 260, height: 40, border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '0 14px', fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif' }}
          />
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            style={{ height: 40, border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '0 12px', fontSize: 14, outline: 'none', background: '#fff', cursor: 'pointer' }}>
            <option value="ALL">Todos los roles</option>
            <option value="ADMIN">Admin</option>
            <option value="VENTAS">Ventas</option>
            <option value="CLIENTE">Cliente</option>
          </select>
        </div>

        {/* Tabla */}
        {loading ? (
          <p style={{ color: '#6B7280' }}>Cargando usuarios...</p>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 12, border: '1px dashed #E5E7EB' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
            <p style={{ color: '#6B7280', fontWeight: 600 }}>No se encontraron usuarios</p>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid #E5E7EB' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F9FAFB' }}>
                  {['Usuario', 'Email', 'Negocio', 'Rol', 'Estado', 'Registro'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #E5E7EB' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((user: any, i: number) => {
                  const r = ROLE_COLORS[user.role] ?? { color: '#374151', bg: '#F3F4F6', label: user.role }
                  const initial = (user.name || user.email || '?').charAt(0).toUpperCase()
                  return (
                    <tr key={user.id} style={{ borderTop: i === 0 ? 'none' : '1px solid #F3F4F6', transition: 'background .1s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#FAFBFF')}
                      onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>

                      {/* Usuario */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: navy, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                            {initial}
                          </div>
                          <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{user.name ?? '—'}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td style={{ padding: '14px 16px', fontSize: 13, color: '#374151' }}>{user.email}</td>

                      {/* Negocio */}
                      <td style={{ padding: '14px 16px', fontSize: 13, color: '#374151' }}>{user.businessName ?? '—'}</td>

                      {/* Rol */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ background: r.bg, color: r.color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{r.label}</span>
                      </td>

                      {/* Estado */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ background: user.isActive ? '#DCFCE7' : '#FEE2E2', color: user.isActive ? '#166534' : '#991B1B', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                          {user.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>

                      {/* Fecha */}
                      <td style={{ padding: '14px 16px', fontSize: 13, color: '#6B7280' }}>
                        {new Date(user.createdAt).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
