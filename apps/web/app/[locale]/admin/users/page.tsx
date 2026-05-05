'use client'
import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/layout/AdminLayout'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

const ROLE_COLORS: Record<string, { color: string; bg: string }> = {
  ADMIN:   { color: '#991B1B', bg: '#FEE2E2' },
  VENTAS:  { color: '#1E40AF', bg: '#DBEAFE' },
  CLIENTE: { color: '#166534', bg: '#DCFCE7' },
}

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('pl_token')
    if (!token) { setLoading(false); return }
    fetch(`${BASE}/api/auth/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => {
        if (!r.ok) throw new Error('Endpoint no disponible')
        return r.json()
      })
      .then(data => { setUsers(data ?? []); setLoading(false) })
      .catch(() => { setError('El módulo de usuarios está en desarrollo'); setLoading(false) })
  }, [])

  return (
    <AdminLayout>
      <div style={{ padding: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Usuarios</h1>
        <p style={{ color: '#6B7280', marginBottom: 32 }}>{users.length} usuarios registrados</p>
        {loading ? <p>Cargando...</p> : error ? (
          <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 12, border: '1px dashed #E5E7EB' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🚧</div>
            <p style={{ color: '#6B7280', fontWeight: 600 }}>{error}</p>
            <p style={{ color: '#9CA3AF', fontSize: 13, marginTop: 8 }}>Próximamente disponible</p>
          </div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 12 }}>
            <div style={{ fontSize: 48 }}>👥</div>
            <p style={{ color: '#6B7280', marginTop: 16 }}>No hay usuarios aún</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 12, overflow: 'hidden' }}>
            <thead>
              <tr style={{ background: '#F9FAFB' }}>
                {['Nombre', 'Email', 'Rol', 'Fecha registro'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user: any) => {
                const r = ROLE_COLORS[user.role] ?? { color: '#374151', bg: '#F3F4F6' }
                return (
                  <tr key={user.id} style={{ borderTop: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: '#111827' }}>{user.name ?? '—'}</td>
                    <td style={{ padding: '14px 16px', fontSize: 14, color: '#374151' }}>{user.email}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ background: r.bg, color: r.color, padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{user.role}</span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13, color: '#6B7280' }}>{new Date(user.createdAt).toLocaleDateString('es')}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  )
}
