'use client'
// app/admin/products/new/page.tsx
// Pantalla de creación de nuevo producto

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AdminLayout } from '@/components/admin/layout/AdminLayout'
import { ProductForm } from '@/components/admin/products/ProductForm'
import { createProduct } from '@/lib/api-admin'
import type { ProductFormData } from '@/types/product'

export default function NewProductPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(data: ProductFormData) {
    setIsSubmitting(true)
    setError(null)
    try {
      const product = await createProduct({
        ...data,
        weight:        data.weight        ? Number(data.weight)        : undefined,
        unitsPerPack:  Number(data.unitsPerPack),
        unitsPerCase:  Number(data.unitsPerCase),
        moq:           Number(data.moq),
        basePrice:     Number(data.basePrice),
        stockQuantity: Number(data.stockQuantity),
      })
      // Redirigir a edición para que el admin pueda subir imágenes
      router.push(`/admin/products/${product.id}?created=1`)
    } catch (e: any) {
      setError(e.message ?? 'Error al crear el producto')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AdminLayout>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: 13, color: '#64748B' }}>
        <Link href="/admin/products" style={{ color: '#64748B', textDecoration: 'none' }}>Productos</Link>
        <span>›</span>
        <span style={{ color: '#0F172A', fontWeight: 600 }}>Nuevo producto</span>
      </div>

      <div style={{ maxWidth: 800 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, fontFamily: 'Poppins, sans-serif', color: '#0F172A', margin: '0 0 4px' }}>
          Crear producto
        </h1>
        <p style={{ color: '#64748B', fontSize: 13, marginBottom: 28 }}>
          Completa la información básica. Después de guardar podrás subir imágenes.
        </p>

        {error && (
          <div style={{
            background: '#FEF2F2', border: '1px solid #FECACA',
            borderRadius: 10, padding: '12px 16px', marginBottom: 20,
            color: '#B91C1C', fontSize: 13, display: 'flex', gap: 8,
          }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', padding: '28px 32px' }}>
          <ProductForm
            onSubmit={handleSubmit}
            onCancel={() => router.push('/admin/products')}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </AdminLayout>
  )
}
