'use client'
// app/admin/products/new/page.tsx
// Pantalla de creación de nuevo producto

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { AdminLayout } from '@/components/admin/layout/AdminLayout'
import { ProductForm } from '@/components/admin/products/ProductForm'
import { createProduct } from '@/lib/api-admin'
import type { ProductFormData } from '@/types/product'

// Convierte ProductFormData (strings) al payload que espera la API
// Mantiene todos los campos como string para satisfacer el tipo ProductFormData
function toApiPayload(data: ProductFormData): ProductFormData {
  return {
    name:            data.name,
    nameEn:          data.nameEn,
    description:     data.description,
    descriptionEn:   data.descriptionEn,
    sku:             data.sku,
    weight:          data.weight || '',
    unitsPerPack:    data.unitsPerPack,
    unitsPerCase:    data.unitsPerCase,
    moq:             data.moq,
    basePrice:       data.basePrice,
    stockQuantity:   data.stockQuantity,
    categoryId:      data.categoryId,
    subcategoryId:   data.subcategoryId,
    isNew:           data.isNew,
    isTopSeller:     data.isTopSeller,
    countryOfOrigin: data.countryOfOrigin,
    status:          data.status,
  }
}

export default function NewProductPage() {
  const params = useParams()
  const locale = params.locale as string || 'es'
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(data: ProductFormData) {
    setIsSubmitting(true)
    setError(null)
    try {
      const product = await createProduct(toApiPayload(data))
      router.push(`/${locale}/admin/products/${product.id}?created=1`)
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
        <Link href={`/${locale}/admin/products`} style={{ color: '#64748B', textDecoration: 'none' }}>Productos</Link>
        <span>›</span>
        <span style={{ color: '#0F172A', fontWeight: 600 }}>Nuevo producto</span>
      </div>

      <div style={{ maxWidth: 800 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, fontFamily: 'Poppins, sans-serif', color: '#0F172A', margin: '0 0 4px' }}>
          Crear producto
        </h1>
        <p style={{ color: '#64748B', fontSize: 13, marginBottom: 28 }}>
          Completa la información básica. Después podrás subir imágenes.
        </p>

        {error && (
          <div style={{
            background: '#FEF2F2', border: '1px solid #FECACA',
            borderRadius: 10, padding: '12px 16px', marginBottom: 20,
            color: '#B91C1C', fontSize: 13,
          }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', padding: '28px 32px' }}>
          <ProductForm
            onSubmit={handleSubmit}
            onCancel={() => router.push(`/${locale}/admin/products`)}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </AdminLayout>
  )
}
