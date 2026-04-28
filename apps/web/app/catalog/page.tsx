'use client'
// apps/web/app/catalog/page.tsx
// Catálogo B2B — grid de productos con filtros, búsqueda y carrito integrado.
// Incluye: paginación, filtro por categoría, búsqueda en tiempo real,
// badges nuevo/top seller, stock, y toast de confirmación al agregar.

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import Link from 'next/link'
import { ProductCard }     from '@/components/catalog/ProductCard'
import { CartButton }      from '@/components/cart/CartButton'
import { fetchProducts, fetchCategories } from '@/lib/api-catalog'

const navy = '#1F3A93'

// ── Skeleton loader ────────────────────────────────────────────────────────────
function ProductSkeleton() {
  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1.5px solid #E2E8F0', overflow: 'hidden' }}>
      <div style={{ height: 180, background: 'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      <div style={{ padding: 14 }}>
        {[80, 60, 40].map(w => (
          <div key={w} style={{ height: 12, background: '#F1F5F9', borderRadius: 4, marginBottom: 8, width: `${w}%` }} />
        ))}
      </div>
    </div>
  )
}

function CatalogContent() {
  const [products,   setProducts]   = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [catFilter,  setCatFilter]  = useState('')
  const [badge,      setBadge]      = useState<'all' | 'new' | 'top'>('all')
  const [page,       setPage]       = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total,      setTotal]      = useState(0)
  const [toast,      setToast]      = useState<string | null>(null)
  const searchTimer = useRef<ReturnType<typeof setTimeout>>()
  const LIMIT = 24

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetchProducts({
        search:      search || undefined,
        categoryId:  catFilter || undefined,
        isNew:       badge === 'new'  ? true : undefined,
        isTopSeller: badge === 'top'  ? true : undefined,
        page,
        limit: LIMIT,
      })
      setProducts(res.data)
      setTotal(res.total)
      setTotalPages(res.totalPages)
    } catch {
      showToast('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }, [search, catFilter, badge, page])

  useEffect(() => {
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(load, search ? 350 : 0)
  }, [load, search])

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {})
  }, [])

  function resetFilters() {
    setSearch(''); setCatFilter(''); setBadge('all'); setPage(1)
  }

  const hasFilters = search || catFilter || badge !== 'all'

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 999, background: navy, color: '#fff', padding: '12px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
          ✓ {toast}
        </div>
      )}

      {/* Header del catálogo */}
      <header style={{ background: navy, padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', gap: 16, position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 4px 20px rgba(31,58,147,.25)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
          {/* REEMPLAZAR LOGO DE PROMESA LATINA AQUÍ */}
          <div style={{ width: 30, height: 30, background: '#E65100', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, color: '#fff' }}>PL</div>
          <span style={{ color: '#fff', fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 13 }}>Promesa Latina</span>
        </Link>

        {/* Buscador */}
        <div style={{ flex: 1, position: 'relative', maxWidth: 440 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)', fontSize: 16 }}>⌕</span>
          <input
            type="text"
            placeholder="Buscar productos, marcas, SKU..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            style={{ width: '100%', height: 38, background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: 20, paddingLeft: 38, paddingRight: 14, fontSize: 13, color: '#fff', outline: 'none', fontFamily: 'Inter, sans-serif' }}
          />
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
          <CartButton lang="es" />
          <Link href="/" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            🌐 Inicio
          </Link>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24, alignItems: 'start' }}>

          {/* ── SIDEBAR FILTROS ──────────────────────────────────────────── */}
          <aside style={{ position: 'sticky', top: 80 }}>

            {/* Categorías */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0', padding: '16px', marginBottom: 14 }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: '#475569', letterSpacing: '0.07em', textTransform: 'uppercase', margin: '0 0 12px' }}>
                Categorías
              </p>
              <button
                onClick={() => { setCatFilter(''); setPage(1) }}
                style={{ width: '100%', textAlign: 'left', padding: '7px 10px', borderRadius: 7, border: 'none', background: !catFilter ? '#EEF2FF' : 'none', color: !catFilter ? navy : '#475569', fontSize: 13, fontWeight: !catFilter ? 700 : 400, cursor: 'pointer', marginBottom: 2 }}
              >
                📦 Todas las categorías
              </button>
              {categories.map(cat => (
                <button key={cat.id}
                  onClick={() => { setCatFilter(cat.id); setPage(1) }}
                  style={{ width: '100%', textAlign: 'left', padding: '7px 10px', borderRadius: 7, border: 'none', background: catFilter === cat.id ? '#EEF2FF' : 'none', color: catFilter === cat.id ? navy : '#475569', fontSize: 13, fontWeight: catFilter === cat.id ? 700 : 400, cursor: 'pointer', marginBottom: 2 }}
                >
                  {cat.icon ?? '🏷️'} {cat.name}
                </button>
              ))}
            </div>

            {/* Badges */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E2E8F0', padding: '16px', marginBottom: 14 }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: '#475569', letterSpacing: '0.07em', textTransform: 'uppercase', margin: '0 0 12px' }}>
                Destacados
              </p>
              {([
                ['all', '🛒 Todos los productos'],
                ['new', '✨ Nuevos productos'],
                ['top', '🔥 Top sellers'],
              ] as const).map(([val, label]) => (
                <button key={val}
                  onClick={() => { setBadge(val); setPage(1) }}
                  style={{ width: '100%', textAlign: 'left', padding: '7px 10px', borderRadius: 7, border: 'none', background: badge === val ? '#FFF3E0' : 'none', color: badge === val ? '#E65100' : '#475569', fontSize: 13, fontWeight: badge === val ? 700 : 400, cursor: 'pointer', marginBottom: 2 }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Reset */}
            {hasFilters && (
              <button onClick={resetFilters}
                style={{ width: '100%', padding: '9px', border: '1px solid #E2E8F0', borderRadius: 8, background: '#fff', color: '#64748B', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                Limpiar filtros ×
              </button>
            )}
          </aside>

          {/* ── GRID DE PRODUCTOS ─────────────────────────────────────────── */}
          <div>
            {/* Barra superior */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 18, fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  {catFilter
                    ? categories.find(c => c.id === catFilter)?.name ?? 'Categoría'
                    : badge === 'new' ? 'Nuevos Productos'
                    : badge === 'top' ? 'Top Sellers'
                    : 'Catálogo Completo'}
                </h2>
                <p style={{ color: '#94A3B8', fontSize: 13, margin: '2px 0 0' }}>
                  {loading ? 'Cargando...' : `${total} productos`}
                </p>
              </div>
            </div>

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {loading
                ? Array.from({ length: 12 }).map((_, i) => <ProductSkeleton key={i} />)
                : products.length === 0
                  ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '56px 24px' }}>
                      <div style={{ fontSize: 48, marginBottom: 14 }}>🔍</div>
                      <h3 style={{ fontFamily: 'Poppins, sans-serif', color: '#0F172A', margin: '0 0 8px' }}>Sin resultados</h3>
                      <p style={{ color: '#64748B', marginBottom: 20 }}>No encontramos productos con esos filtros</p>
                      <button onClick={resetFilters}
                        style={{ background: navy, color: '#fff', padding: '10px 24px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>
                        Limpiar filtros
                      </button>
                    </div>
                  )
                  : products.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      lang="es"
                      onToast={showToast}
                    />
                  ))
              }
            </div>

            {/* Paginación */}
            {totalPages > 1 && !loading && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 28 }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{ padding: '8px 16px', border: '1.5px solid #E2E8F0', borderRadius: 8, background: '#fff', color: page === 1 ? '#CBD5E1' : '#374151', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600 }}>
                  ← Anterior
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = page <= 3 ? i + 1 : page - 2 + i
                  if (p < 1 || p > totalPages) return null
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      style={{ width: 36, height: 36, border: '1.5px solid', borderColor: p === page ? navy : '#E2E8F0', borderRadius: 8, background: p === page ? navy : '#fff', color: p === page ? '#fff' : '#374151', cursor: 'pointer', fontSize: 13, fontWeight: p === page ? 700 : 400 }}>
                      {p}
                    </button>
                  )
                })}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{ padding: '8px 16px', border: '1.5px solid #E2E8F0', borderRadius: 8, background: '#fff', color: page === totalPages ? '#CBD5E1' : '#374151', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600 }}>
                  Siguiente →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  )
}

export default function CatalogPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: 64, textAlign: 'center', color: '#94A3B8' }}>Cargando catálogo...</div>
    }>
      <CatalogContent />
    </Suspense>
  )
}
