'use client'
import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/layout/AdminLayout'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${BASE}/api/categories`)
      .then(r => r.json())
      .then(data => { setCategories(data ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <AdminLayout>
      <div style={{ padding: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Categorías</h1>
        <p style={{ color: '#6B7280', marginBottom: 32 }}>{categories.length} categorías en total</p>
        {loading ? <p>Cargando...</p> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {categories.map((cat: any) => (
              <div key={cat.id} style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{cat.emoji ?? '🏷️'}</div>
                <div style={{ fontWeight: 600, color: '#111827', marginBottom: 4 }}>{cat.nameEs ?? cat.name}</div>
                <div style={{ fontSize: 13, color: '#6B7280' }}>{cat.nameEn}</div>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 8 }}>{cat._count?.products ?? 0} productos</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
