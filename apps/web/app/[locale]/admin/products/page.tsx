'use client'
// app/admin/products/page.tsx
// Listado de productos con:
//  - tabla con columnas: imagen, nombre, SKU, categoría, precio, stock, estado
//  - búsqueda en tiempo real (debounce 300ms)
//  - filtros por categoría y estado
//  - paginación
//  - acciones: editar, ocultar/activar, duplicar, eliminar
//  - acceso rápido al botón "Nuevo producto"

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/admin/layout/AdminLayout'
import {
  getProducts, getCategories, updateProductStatus, deleteProduct, duplicateProduct,
} from '@/lib/api-admin'
import type { Product, Category, ProductStatus } from '@/types/product'

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE:  { label: 'Activo',  color: '#166534', bg: '#DCFCE7' },
  HIDDEN:  { label: 'Oculto',  color: '#92400E', bg: '#FEF3C7' },
  DELETED: { label: 'Eliminado', color: '#991B1B', bg: '#FEE2E2' },
}

export default function ProductsPage() {
  const router = useRouter()

  const [products,    setProducts]    = useState<Product[]>([])
  const [categories,  setCategories]  = useState<Category[]>([])
  const [search,      setSearch]      = useState('')
  const [catFilter,   setCatFilter]   = useState('')
  const [statusFilter,setStatusFilter]= useState<'ALL' | ProductStatus>('ALL')
  const [page,        setPage]        = useState(1)
  const [total,       setTotal]       = useState(0)
  const [totalPages,  setTotalPages]  = useState(1)
  const [loading,     setLoading]     = useState(true)
  const [actionId,    setActionId]    = useState<string | null>(null)
  const [toast,       setToast]       = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const searchTimer = useRef<ReturnType<typeof setTimeout>>()
  const LIMIT = 20

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Cargar categorías una sola vez
  useEffect(() => {
    getCategories().then(setCategories).catch(() => {})
  }, [])

  // Cargar productos con debounce en búsqueda
  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getProducts({
        search: search || undefined,
        categoryId: catFilter || undefined,
        status: statusFilter,
        page,
        limit: LIMIT,
      })
      setProducts(result.data)
      setTotal(result.total)
      setTotalPages(result.totalPages)
    } catch {
      showToast('Error al cargar productos', 'err')
    } finally {
      setLoading(false)
    }
  }, [search, catFilter, statusFilter, page])

  useEffect(() => {
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(loadProducts, search ? 300 : 0)
  }, [loadProducts, search])

  // ─── Acciones ──────────────────────────────────────────────────────────
  async function handleToggleStatus(product: Product) {
    const next: ProductStatus = product.status === 'ACTIVE' ? 'HIDDEN' : 'ACTIVE'
    setActionId(product.id)
    try {
      await updateProductStatus(product.id, next)
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: next } : p))
      showToast(`Producto ${next === 'ACTIVE' ? 'activado' : 'ocultado'}`)
    } catch {
      showToast('Error al cambiar estado', 'err')
    } finally {
      setActionId(null)
    }
  }

  async function handleDuplicate(id: string) {
    setActionId(id)
    try {
      await duplicateProduct(id)
      showToast('Producto duplicado')
      loadProducts()
    } catch {
      showToast('Error al duplicar', 'err')
    } finally {
      setActionId(null)
    }
  }

  async function handleDelete(product: Product) {
    if (!confirm(`¿Eliminar "${product.name}"? Esta acción es irreversible.`)) return
    setActionId(product.id)
    try {
      await deleteProduct(product.id)
      setProducts(prev => prev.filter(p => p.id !== product.id))
      showToast('Producto eliminado')
    } catch {
      showToast('Error al eliminar', 'err')
    } finally {
      setActionId(null)
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────
  return (
    <AdminLayout>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 16, right: 16, zIndex: 999,
          background: toast.type === 'ok' ? '#1F3A93' : '#EF4444',
          color: '#fff', padding: '12px 20px', borderRadius: 10,
          fontSize: 13, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        }}>
          {toast.type === 'ok' ? '✓ ' : '⚠️ '}{toast.msg}
        </div>
      )}

      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0F172A', fontFamily: 'Poppins, sans-serif', margin: 0 }}>
            Productos
          </h1>
          <p style={{ color: '#64748B', fontSize: 13, margin: '4px 0 0' }}>
            {total} productos en total
          </p>
        </div>
        <Link
          href="/admin/products/new"
          style={{
            background: '#1F3A93', color: '#fff',
            padding: '10px 20px', borderRadius: 8,
            textDecoration: 'none', fontSize: 13, fontWeight: 600,
            fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          + Nuevo producto
        </Link>
      </div>

      {/* Filtros */}
      <div style={{
        background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0',
        padding: '16px 20px', marginBottom: 20,
        display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center',
      }}>
        {/* Búsqueda */}
        <div style={{ position: 'relative', flex: '1', minWidth: 220 }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: 14 }}>🔍</span>
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            style={{
              width: '100%', height: 38, paddingLeft: 32, paddingRight: 12,
              border: '1.5px solid #E2E8F0', borderRadius: 8,
              fontSize: 13, color: '#1E293B', background: '#FAFBFD',
              outline: 'none', fontFamily: 'Inter, sans-serif',
            }}
          />
        </div>

        {/* Filtro categoría */}
        <select
          value={catFilter}
          onChange={e => { setCatFilter(e.target.value); setPage(1) }}
          style={{
            height: 38, padding: '0 12px', border: '1.5px solid #E2E8F0',
            borderRadius: 8, fontSize: 13, color: '#1E293B',
            background: '#FAFBFD', fontFamily: 'Inter, sans-serif', minWidth: 160,
          }}
        >
          <option value="">Todas las categorías</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        {/* Filtro estado */}
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value as any); setPage(1) }}
          style={{
            height: 38, padding: '0 12px', border: '1.5px solid #E2E8F0',
            borderRadius: 8, fontSize: 13, color: '#1E293B',
            background: '#FAFBFD', fontFamily: 'Inter, sans-serif',
          }}
        >
          <option value="ALL">Todos los estados</option>
          <option value="ACTIVE">Activos</option>
          <option value="HIDDEN">Ocultos</option>
        </select>

        {/* Reset filtros */}
        {(search || catFilter || statusFilter !== 'ALL') && (
          <button
            onClick={() => { setSearch(''); setCatFilter(''); setStatusFilter('ALL'); setPage(1) }}
            style={{
              height: 38, padding: '0 14px', border: '1px solid #E2E8F0',
              borderRadius: 8, fontSize: 12, color: '#64748B',
              background: '#fff', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            }}
          >
            Limpiar filtros ×
          </button>
        )}
      </div>

      {/* Tabla */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#94A3B8', fontSize: 14 }}>
            Cargando productos...
          </div>
        ) : products.length === 0 ? (
          <div style={{ padding: 56, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
            <p style={{ color: '#64748B', fontWeight: 600, fontSize: 15 }}>No se encontraron productos</p>
            <p style={{ color: '#94A3B8', fontSize: 13, marginTop: 4 }}>
              {search ? `No hay resultados para "${search}"` : 'Crea tu primer producto para empezar'}
            </p>
            {!search && (
              <Link href="/admin/products/new" style={{ display: 'inline-block', marginTop: 16, background: '#1F3A93', color: '#fff', padding: '10px 20px', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                + Crear primer producto
              </Link>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #F1F5F9', background: '#F8FAFC' }}>
                  <th style={thStyle}>Imagen</th>
                  <th style={thStyle}>Nombre / SKU</th>
                  <th style={thStyle}>Categoría</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Precio base</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>Stock</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>Estado</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => {
                  const st = STATUS_LABELS[product.status]
                  const busy = actionId === product.id
                  return (
                    <tr
                      key={product.id}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        opacity: busy ? 0.5 : 1,
                        transition: 'opacity .15s',
                      }}
                    >
                      {/* Imagen */}
                      <td style={{ padding: '12px 16px', width: 60 }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: 8,
                          background: '#F1F5F9', overflow: 'hidden',
                          flexShrink: 0,
                        }}>
                          {product.mainImageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.mainImageUrl}
                              alt={product.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📦</div>
                          )}
                        </div>
                      </td>

                      {/* Nombre / SKU */}
                      <td style={{ padding: '12px 16px' }}>
                        <p style={{ fontWeight: 600, color: '#0F172A', margin: 0 }}>{product.name}</p>
                        <p style={{ color: '#94A3B8', fontSize: 11, margin: '2px 0 0', fontFamily: 'monospace' }}>{product.sku}</p>
                        {product.isNew && <span style={{ fontSize: 9, background: '#DBEAFE', color: '#1E40AF', padding: '1px 5px', borderRadius: 3, fontWeight: 700, marginRight: 4 }}>NUEVO</span>}
                        {product.isTopSeller && <span style={{ fontSize: 9, background: '#FEF3C7', color: '#92400E', padding: '1px 5px', borderRadius: 3, fontWeight: 700 }}>TOP</span>}
                      </td>

                      {/* Categoría */}
                      <td style={{ padding: '12px 16px', color: '#475569' }}>
                        {product.category?.name ?? '—'}
                        {product.subcategory && <p style={{ fontSize: 11, color: '#94A3B8', margin: '2px 0 0' }}>{product.subcategory.name}</p>}
                      </td>

                      {/* Precio */}
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#1F3A93', fontFamily: 'Poppins, sans-serif' }}>
                        ${product.basePrice.toFixed(2)}
                        <p style={{ fontSize: 10, color: '#94A3B8', fontWeight: 400, margin: '1px 0 0', fontFamily: 'Inter, sans-serif' }}>/ caja</p>
                      </td>

                      {/* Stock */}
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span style={{
                          fontWeight: 600,
                          color: product.stockQuantity === 0 ? '#EF4444' : product.stockQuantity < 10 ? '#F59E0B' : '#22C55E',
                        }}>
                          {product.stockQuantity}
                        </span>
                      </td>

                      {/* Estado */}
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span style={{
                          background: st.bg, color: st.color,
                          fontSize: 11, fontWeight: 700,
                          padding: '3px 8px', borderRadius: 5,
                          letterSpacing: '0.04em',
                        }}>
                          {st.label}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          <ActionBtn title="Editar" onClick={() => router.push(`/admin/products/${product.id}`)} disabled={busy}>✏️</ActionBtn>
                          <ActionBtn title={product.status === 'ACTIVE' ? 'Ocultar' : 'Activar'} onClick={() => handleToggleStatus(product)} disabled={busy}>
                            {product.status === 'ACTIVE' ? '👁️' : '✅'}
                          </ActionBtn>
                          <ActionBtn title="Duplicar" onClick={() => handleDuplicate(product.id)} disabled={busy}>⧉</ActionBtn>
                          <ActionBtn title="Eliminar" onClick={() => handleDelete(product)} disabled={busy} danger>🗑️</ActionBtn>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: '1px solid #F1F5F9' }}>
            <span style={{ fontSize: 12, color: '#64748B' }}>
              Página {page} de {totalPages} · {total} productos
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <PaginationBtn onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Anterior</PaginationBtn>
              <PaginationBtn onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Siguiente →</PaginationBtn>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

// ─── Micro componentes ────────────────────────────────────────────────────────
const thStyle: React.CSSProperties = {
  padding: '12px 16px', textAlign: 'left',
  fontSize: 11, fontWeight: 700, color: '#64748B',
  letterSpacing: '0.06em', textTransform: 'uppercase',
}

function ActionBtn({ title, onClick, disabled, danger, children }: {
  title: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: React.ReactNode
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 30, height: 30, border: '1px solid #E2E8F0',
        borderRadius: 6, background: danger ? '#FEF2F2' : '#F8FAFC',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: disabled ? 0.4 : 1, transition: 'all .15s',
      }}
    >
      {children}
    </button>
  )
}

function PaginationBtn({ children, onClick, disabled }: {
  children: React.ReactNode; onClick: () => void; disabled: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '6px 14px', border: '1px solid #E2E8F0',
        borderRadius: 7, fontSize: 12, fontWeight: 600,
        background: disabled ? '#F8FAFC' : '#fff',
        color: disabled ? '#CBD5E1' : '#374151',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {children}
    </button>
  )
}
