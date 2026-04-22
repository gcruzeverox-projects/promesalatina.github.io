'use client'
// app/admin/products/[id]/page.tsx
// Pantalla de edición de producto + gestión completa de imágenes

import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AdminLayout } from '@/components/admin/layout/AdminLayout'
import { ProductForm } from '@/components/admin/products/ProductForm'
import { getProduct, updateProduct } from '@/lib/api-admin'
import type { Product, ProductFormData } from '@/types/product'

export default function EditProductPage() {
  const params       = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const router       = useRouter()
  const justCreated  = searchParams.get('created') === '1'

  const [product,     setProduct]     = useState<Product | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [isSubmitting,setIsSubmitting]= useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const [saved,       setSaved]       = useState(false)

  useEffect(() => {
    if (!params.id) return
    getProduct(params.id)
      .then(setProduct)
      .catch(() => setError('Producto no encontrado'))
      .finally(() => setLoading(false))
  }, [params.id])

  async function handleSubmit(data: ProductFormData) {
    if (!product) return
    setIsSubmitting(true)
    setError(null)
    try {
      const updated = await updateProduct(product.id, {
        ...data,
        weight:        data.weight        ? Number(data.weight)        : undefined,
        unitsPerPack:  Number(data.unitsPerPack),
        unitsPerCase:  Number(data.unitsPerCase),
        moq:           Number(data.moq),
        basePrice:     Number(data.basePrice),
        stockQuantity: Number(data.stockQuantity),
      })
      setProduct(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e: any) {
      setError(e.message ?? 'Error al guardar')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ padding: 64, textAlign: 'center', color: '#94A3B8' }}>Cargando producto...</div>
      </AdminLayout>
    )
  }

  if (!product) {
    return (
      <AdminLayout>
        <div style={{ padding: 48, textAlign: 'center' }}>
          <p style={{ color: '#EF4444', fontWeight: 600 }}>Producto no encontrado</p>
          <Link href="/admin/products" style={{ color: '#1F3A93', fontSize: 13 }}>← Volver al listado</Link>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: 13, color: '#64748B' }}>
        <Link href="/admin/products" style={{ color: '#64748B', textDecoration: 'none' }}>Productos</Link>
        <span>›</span>
        <span style={{ color: '#0F172A', fontWeight: 600, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {product.name}
        </span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
        {/* Imagen miniatura */}
        <div style={{
          width: 52, height: 52, borderRadius: 10, overflow: 'hidden',
          background: '#F1F5F9', border: '1px solid #E2E8F0', flexShrink: 0,
        }}>
          {product.mainImageUrl
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={product.mainImageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>📦</div>
          }
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, fontFamily: 'Poppins, sans-serif', color: '#0F172A', margin: 0 }}>
            {product.name}
          </h1>
          <p style={{ color: '#94A3B8', fontSize: 12, margin: '3px 0 0', fontFamily: 'monospace' }}>
            SKU: {product.sku}
          </p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          {saved && (
            <span style={{ fontSize: 12, color: '#22C55E', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              ✓ Guardado
            </span>
          )}
        </div>
      </div>

      {/* Banner "recién creado" */}
      {justCreated && (
        <div style={{
          background: '#F0FDF4', border: '1px solid #86EFAC',
          borderRadius: 10, padding: '12px 16px', marginBottom: 20,
          fontSize: 13, color: '#166534', display: 'flex', gap: 8,
        }}>
          ✅ Producto creado exitosamente. Ahora puedes subir imágenes en la pestaña <strong>Imágenes</strong>.
        </div>
      )}

      {error && (
        <div style={{
          background: '#FEF2F2', border: '1px solid #FECACA',
          borderRadius: 10, padding: '12px 16px', marginBottom: 20,
          color: '#B91C1C', fontSize: 13,
        }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ maxWidth: 800 }}>
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', padding: '28px 32px' }}>
          <ProductForm
            product={product}
            onSubmit={handleSubmit}
            onCancel={() => router.push('/admin/products')}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </AdminLayout>
  )
}
