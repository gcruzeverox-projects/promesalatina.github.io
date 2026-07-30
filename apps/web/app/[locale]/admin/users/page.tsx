'use client'
import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/layout/AdminLayout'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
const navy = '#1F3A93'

const ROLE_COLORS: Record<string, { color: string; bg: string; label: string }> = {
  ADMIN:   { color: '#991B1B', bg: '#FEE2E2', label: 'Admin' },
  VENTAS:  { color: '#1E40AF', bg: '#DBEAFE', label: 'Ventas' },
  CLIENTE: { color: '#166534', bg: '#DCFCE7', label: 'Cliente' },
}

function Modal({ title, onClose, children }: any) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '90%', maxWidth: 500, fontFamily: 'Inter, sans-serif', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111827' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6B7280' }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function UsersPage() {
  const [users,      setUsers]      = useState<any[]>([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [modal,      setModal]      = useState<'create' | 'edit' | null>(null)
  const [selected,   setSelected]   = useState<any>(null)
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState('')
  const [form,       setForm]       = useState({ name: '', email: '', password: '', businessName: '', phone: '', role: 'CLIENTE' })

  const token = typeof window !== 'undefined' ? localStorage.getItem('pl_token') : ''
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  function load() {
    fetch(`${BASE}/api/auth/users`, { headers })
      .then(r => r.json())
      .then(data => { setUsers(Array.isArray(data) ? data : data.data ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.businessName?.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter
    return matchSearch && matchRole
  })

  function openCreate() {
    setForm({ name: '', email: '', password: '', businessName: '', phone: '', role: 'CLIENTE' })
    setError('')
    setModal('create')
  }

  function openEdit(user: any) {
    setSelected(user)
    setForm({ name: user.name ?? '', email: user.email, password: '', businessName: user.businessName ?? '', phone: user.phone ?? '', role: user.role })
    setError('')
    setModal('edit')
  }

  async function handleSave() {
    if (!form.name.trim() || !form.email.trim()) { setError('Nombre y email son requeridos'); return }
    if (modal === 'create' && !form.password.trim()) { setError('La contraseña es requerida'); return }
    setSaving(true)
    try {
      let res
      if (modal === 'create') {
        res = await fetch(`${BASE}/api/auth/register`, { method: 'POST', headers, body: JSON.stringify(form) })
      } else {
        const body: any = { name: form.name, businessName: form.businessName, phone: form.phone, role: form.role }
        if (form.password) body.password = form.password
        res = await fetch(`${BASE}/api/auth/users/${selected.id}`, { method: 'PUT', headers, body: JSON.stringify(body) })
      }
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.message ?? 'Error al guardar')
      }
      load()
      setModal(null)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle(user: any) {
    const action = user.isActive ? 'desactivar' : 'activar'
    if (!confirm(`¿${action} al usuario "${user.name}"?`)) return
    await fetch(`${BASE}/api/auth/users/${user.id}/toggle`, { method: 'PATCH', headers })
    load()
  }

  const inp: React.CSSProperties = {
    width: '100%', height: 42, border: '1.5px solid #E2E8F0', borderRadius: 8,
    padding: '0 12px', fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif',
    boxSizing: 'border-box',
  }

  return (
    <AdminLayout>
      <div style={{ padding: 32, fontFamily: 'Inter, sans-serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Usuarios</h1>
            <p style={{ color: '#6B7280', margin: 0 }}>{filtered.length} de {users.length} usuarios</p>
          </div>
          <button onClick={openCreate}
            style={{ background: navy, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            + Nuevo usuario
          </button>
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
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
        {loading ? <p>Cargando...</p> : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, background: '#fff', borderRadius: 12, border: '1px dashed #E5E7EB' }}>
            <div style={{ fontSize: 48 }}>👥</div>
            <p style={{ color: '#6B7280', marginTop: 16 }}>No se encontraron usuarios</p>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid #E5E7EB' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  {['Usuario', 'Email', 'Negocio', 'Rol', 'Estado', 'Registro', 'Acciones'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #E5E7EB' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((user: any, i: number) => {
                  const r = ROLE_COLORS[user.role] ?? { color: '#374151', bg: '#F3F4F6', label: user.role }
                  const initial = (user.name || user.email || '?').charAt(0).toUpperCase()
                  return (
                    <tr key={user.id} style={{ borderTop: i === 0 ? 'none' : '1px solid #F3F4F6' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#FAFBFF')}
                      onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: navy, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                            {initial}
                          </div>
                          <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{user.name ?? '—'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: '#374151' }}>{user.email}</td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: '#374151' }}>{user.businessName ?? '—'}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ background: r.bg, color: r.color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{r.label}</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ background: user.isActive ? '#DCFCE7' : '#FEE2E2', color: user.isActive ? '#166534' : '#991B1B', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                          {user.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: '#6B7280' }}>
                        {new Date(user.createdAt).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => openEdit(user)}
                            style={{ background: '#EEF2FF', color: navy, border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                            ✏️ Editar
                          </button>
                          <button onClick={() => handleToggle(user)}
                            style={{ background: user.isActive ? '#FEF3C7' : '#DCFCE7', color: user.isActive ? '#92400E' : '#166534', border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                            {user.isActive ? '⏸ Desactivar' : '▶ Activar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <Modal title={modal === 'create' ? 'Nuevo usuario' : 'Editar usuario'} onClose={() => setModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Nombre *</label>
              <input style={inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nombre completo" />
            </div>
            {modal === 'create' && (
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Email *</label>
                <input style={inp} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="correo@ejemplo.com" />
              </div>
            )}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>
                {modal === 'create' ? 'Contraseña *' : 'Nueva contraseña (dejar vacío para no cambiar)'}
              </label>
              <input style={inp} type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Nombre del negocio</label>
              <input style={inp} value={form.businessName} onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))} placeholder="Ej: La Tiendita Latina" />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Teléfono</label>
              <input style={inp} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 (213) 555-0100" />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Rol</label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                style={{ ...inp, cursor: 'pointer' }}>
                <option value="CLIENTE">Cliente</option>
                <option value="VENTAS">Ventas</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            {error && <p style={{ color: '#DC2626', fontSize: 13, margin: 0 }}>⚠️ {error}</p>}
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button onClick={handleSave} disabled={saving}
                style={{ flex: 1, background: navy, color: '#fff', border: 'none', borderRadius: 8, padding: '11px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button onClick={() => setModal(null)}
                style={{ flex: 1, background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: 8, padding: '11px 0', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                Cancelar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  )
}
