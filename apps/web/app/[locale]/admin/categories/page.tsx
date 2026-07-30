'use client'
import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/layout/AdminLayout'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
const navy = '#1F3A93'

const EMOJIS = ['🥤','🫧','🍪','🍞','🌾','💊','🧊','🥩','🧃','🍫','🧂','🏷️']

function Modal({ title, onClose, children }: any) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '90%', maxWidth: 480, fontFamily: 'Inter, sans-serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111827' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6B7280' }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading,    setLoading]    = useState(true)
  const [modal,      setModal]      = useState<'create' | 'edit' | null>(null)
  const [selected,   setSelected]   = useState<any>(null)
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState(''  )
  const [form,       setForm]       = useState({ name: '', nameEn: '', icon: '🏷️' })

  const token = typeof window !== 'undefined' ? localStorage.getItem('pl_token') : ''
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  function load() {
    fetch(`${BASE}/api/categories`)
      .then(r => r.json())
      .then(data => { setCategories(data ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setForm({ name: '', nameEn: '', icon: '🏷️' })
    setError('')
    setModal('create')
  }

  function openEdit(cat: any) {
    setSelected(cat)
    setForm({ name: cat.name, nameEn: cat.nameEn ?? '', icon: cat.icon ?? '🏷️' })
    setError('')
    setModal('edit')
  }

  async function handleSave() {
    if (!form.name.trim()) { setError('El nombre es requerido'); return }
    setSaving(true)
    try {
      const url    = modal === 'create' ? `${BASE}/api/categories` : `${BASE}/api/categories/${selected.id}`
      const method = modal === 'create' ? 'POST' : 'PUT'
      const res    = await fetch(url, { method, headers, body: JSON.stringify(form) })
      if (!res.ok) throw new Error('Error al guardar')
      load()
      setModal(null)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(cat: any) {
    if (!confirm(`¿Eliminar la categoría "${cat.name}"? Esta acción no se puede deshacer.`)) return
    const res = await fetch(`${BASE}/api/categories/${cat.id}`, { method: 'DELETE', headers })
    if (res.ok) {
      load()
    } else {
      const d = await res.json()
      alert(d.message ?? 'No se puede eliminar esta categoría')
    }
  }

  const inp: React.CSSProperties = {
    width: '100%', height: 42, border: '1.5px solid #E2E8F0', borderRadius: 8,
    padding: '0 12px', fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif',
    boxSizing: 'border-box',
  }

  return (
    <AdminLayout>
      <div style={{ padding: 32, fontFamily: 'Inter, sans-serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Categorías</h1>
            <p style={{ color: '#6B7280', margin: 0 }}>{categories.length} categorías en total</p>
          </div>
          <button onClick={openCreate} style={{ background: navy, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            + Nueva categoría
          </button>
        </div>

        {loading ? <p>Cargando...</p> : (
          <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid #E5E7EB' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  {['Icono', 'Nombre', 'Nombre EN', 'Productos', 'Acciones'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {categories.map((cat: any, i: number) => (
                  <tr key={cat.id} style={{ borderTop: i === 0 ? 'none' : '1px solid #F3F4F6' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#FAFBFF')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
                    <td style={{ padding: '14px 16px', fontSize: 24 }}>{cat.icon ?? '🏷️'}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#111827', fontSize: 14 }}>{cat.name}</td>
                    <td style={{ padding: '14px 16px', color: '#6B7280', fontSize: 14 }}>{cat.nameEn}</td>
                    <td style={{ padding: '14px 16px', color: '#6B7280', fontSize: 14 }}>{cat._count?.products ?? 0}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => openEdit(cat)}
                          style={{ background: '#EEF2FF', color: navy, border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                          ✏️ Editar
                        </button>
                        <button onClick={() => handleDelete(cat)}
                          style={{ background: '#FEE2E2', color: '#991B1B', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                          🗑 Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <Modal title={modal === 'create' ? 'Nueva categoría' : 'Editar categoría'} onClose={() => setModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Nombre (Español) *</label>
              <input style={inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ej: Jugos & Bebidas" />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Nombre (English)</label>
              <input style={inp} value={form.nameEn} onChange={e => setForm(f => ({ ...f, nameEn: e.target.value }))} placeholder="Ej: Juices & Beverages" />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Ícono</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => setForm(f => ({ ...f, icon: e }))}
                    style={{ fontSize: 22, background: form.icon === e ? '#EEF2FF' : '#F9FAFB', border: form.icon === e ? `2px solid ${navy}` : '2px solid transparent', borderRadius: 8, padding: '4px 8px', cursor: 'pointer' }}>
                    {e}
                  </button>
                ))}
              </div>
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
