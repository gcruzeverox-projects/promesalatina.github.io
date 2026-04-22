'use client'
// components/admin/products/ProductForm.tsx
// Formulario completo de crear / editar producto
// Incluye validación client-side, selector de categoría/subcategoría dinámico,
// y el componente ImageUploader integrado.

import { useState, useEffect } from 'react'
import type { Product, ProductFormData, Category } from '@/types/product'
import { ImageUploader } from './ImageUploader'
import { getCategories, uploadProductImages, deleteProductImage, reorderProductImages } from '@/lib/api-admin'

interface Props {
  product?: Product       // si existe → modo edición
  onSubmit: (data: ProductFormData) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

const INITIAL: ProductFormData = {
  name: '', nameEn: '',
  description: '', descriptionEn: '',
  sku: '',
  weight: '', unitsPerPack: '1', unitsPerCase: '1',
  moq: '1', basePrice: '',
  stockQuantity: '0',
  categoryId: '', subcategoryId: '',
  isNew: false, isTopSeller: false,
  countryOfOrigin: '',
  status: 'ACTIVE',
}

// ─── Input estilizado reutilizable ────────────────────────────────────────────
function Field({
  label, name, value, onChange, type = 'text',
  placeholder, required, hint, min,
}: {
  label: string; name: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean; hint?: string; min?: string
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, letterSpacing: '0.03em' }}>
        {label} {required && <span style={{ color: '#EF4444' }}>*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        min={min}
        step={type === 'number' ? 'any' : undefined}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        style={{
          width: '100%', height: 40,
          border: '1.5px solid #E2E8F0',
          borderRadius: 8, padding: '0 12px',
          fontSize: 14, color: '#1E293B',
          background: '#FAFBFD',
          outline: 'none',
          fontFamily: 'Inter, sans-serif',
          transition: 'border-color .15s',
        }}
        onFocus={e => (e.target.style.borderColor = '#1F3A93')}
        onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
      />
      {hint && <p style={{ color: '#94A3B8', fontSize: 11, marginTop: 4 }}>{hint}</p>}
    </div>
  )
}

function TextAreaField({ label, name, value, onChange, placeholder, rows = 3 }: {
  label: string; name: string; value: string; onChange: (v: string) => void;
  placeholder?: string; rows?: number
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, letterSpacing: '0.03em' }}>
        {label}
      </label>
      <textarea
        name={name}
        value={value}
        rows={rows}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', border: '1.5px solid #E2E8F0',
          borderRadius: 8, padding: '10px 12px',
          fontSize: 14, color: '#1E293B',
          background: '#FAFBFD', resize: 'vertical',
          fontFamily: 'Inter, sans-serif',
          outline: 'none',
        }}
        onFocus={e => (e.target.style.borderColor = '#1F3A93')}
        onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
      />
    </div>
  )
}

function Toggle({ label, checked, onChange, hint }: {
  label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string
}) {
  return (
    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginBottom: 14 }}>
      <div style={{ position: 'relative', flexShrink: 0, marginTop: 2 }}>
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ opacity: 0, position: 'absolute' }} />
        <div style={{
          width: 36, height: 20, borderRadius: 10,
          background: checked ? '#1F3A93' : '#CBD5E1',
          transition: 'background .2s', position: 'relative',
        }}>
          <div style={{
            position: 'absolute', top: 2,
            left: checked ? 18 : 2,
            width: 16, height: 16, borderRadius: '50%',
            background: '#fff', transition: 'left .2s',
          }} />
        </div>
      </div>
      <div>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{label}</span>
        {hint && <p style={{ fontSize: 11, color: '#94A3B8', margin: '2px 0 0' }}>{hint}</p>}
      </div>
    </label>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function ProductForm({ product, onSubmit, onCancel, isSubmitting }: Props) {
  const isEdit = !!product
  const [form, setForm]           = useState<ProductFormData>(
    product
      ? {
          name:            product.name,
          nameEn:          product.nameEn ?? '',
          description:     product.description ?? '',
          descriptionEn:   product.descriptionEn ?? '',
          sku:             product.sku,
          weight:          product.weight ? String(product.weight) : '',
          unitsPerPack:    String(product.unitsPerPack),
          unitsPerCase:    String(product.unitsPerCase),
          moq:             String(product.moq),
          basePrice:       String(product.basePrice),
          stockQuantity:   String(product.stockQuantity),
          categoryId:      product.categoryId,
          subcategoryId:   product.subcategoryId ?? '',
          isNew:           product.isNew,
          isTopSeller:     product.isTopSeller,
          countryOfOrigin: product.countryOfOrigin ?? '',
          status:          product.status,
        }
      : INITIAL
  )
  const [categories, setCategories]   = useState<Category[]>([])
  const [errors, setErrors]           = useState<Partial<Record<keyof ProductFormData, string>>>({})
  const [activeTab, setActiveTab]     = useState<'basic' | 'media' | 'stock'>('basic')

  // Subcategorías del categoryId seleccionado
  const subcats = categories.find(c => c.id === form.categoryId)?.subcategories ?? []

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {})
  }, [])

  function set(field: keyof ProductFormData) {
    return (value: string | boolean) => {
      setForm(prev => ({ ...prev, [field]: value }))
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  function validate(): boolean {
    const e: typeof errors = {}
    if (!form.name.trim())       e.name       = 'El nombre es obligatorio'
    if (!form.sku.trim())        e.sku        = 'El SKU es obligatorio'
    if (!form.categoryId)        e.categoryId = 'Selecciona una categoría'
    if (!form.basePrice || isNaN(Number(form.basePrice))) e.basePrice = 'Precio base inválido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) { setActiveTab('basic'); return }
    await onSubmit(form)
  }

  // ─── Handlers para ImageUploader ─────────────────────────────────────────
  const handleImageUpload = async (files: File[]) => {
    if (!product?.id) return
    await uploadProductImages(product.id, files)
  }
  const handleImageDelete = async (imageId: string) => {
    if (!product?.id) return
    await deleteProductImage(product.id, imageId)
  }
  const handleImageReorder = async (imageIds: string[]) => {
    if (!product?.id) return
    await reorderProductImages(product.id, imageIds)
  }

  // ─── Estilos compartidos ──────────────────────────────────────────────────
  const tabStyle = (tab: typeof activeTab) => ({
    padding: '10px 20px', border: 'none', cursor: 'pointer',
    fontSize: 13, fontWeight: 600,
    borderBottom: activeTab === tab ? '2px solid #1F3A93' : '2px solid transparent',
    color: activeTab === tab ? '#1F3A93' : '#64748B',
    background: 'none',
    transition: 'all .15s',
    fontFamily: 'Inter, sans-serif',
  })

  const gridTwo = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' } as React.CSSProperties

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} noValidate>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', marginBottom: 28 }}>
        <button type="button" style={tabStyle('basic')}  onClick={() => setActiveTab('basic')}>📝 Información básica</button>
        <button type="button" style={tabStyle('media')}  onClick={() => setActiveTab('media')}>🖼️ Imágenes</button>
        <button type="button" style={tabStyle('stock')}  onClick={() => setActiveTab('stock')}>📦 Inventario & precios</button>
      </div>

      {/* ─── TAB: Información básica ───────────────────────────────────────── */}
      {activeTab === 'basic' && (
        <>
          <div style={gridTwo}>
            <div>
              <Field label="Nombre (Español)" name="name" value={form.name} onChange={set('name')} required placeholder="Ej: Gaseosa Colombiana Postobon" />
              {errors.name && <p style={{ color: '#EF4444', fontSize: 11, marginTop: -14, marginBottom: 10 }}>{errors.name}</p>}
            </div>
            <Field label="Nombre (English)" name="nameEn" value={form.nameEn} onChange={set('nameEn')} placeholder="Ej: Colombian Soda Postobon" />
          </div>

          <div style={gridTwo}>
            <div>
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, letterSpacing: '0.03em' }}>
                  Categoría <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <select
                  value={form.categoryId}
                  onChange={e => { set('categoryId')(e.target.value); set('subcategoryId')('') }}
                  style={{
                    width: '100%', height: 40, border: '1.5px solid #E2E8F0',
                    borderRadius: 8, padding: '0 12px', fontSize: 14,
                    color: '#1E293B', background: '#FAFBFD', fontFamily: 'Inter, sans-serif',
                  }}
                >
                  <option value="">Seleccionar categoría...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.categoryId && <p style={{ color: '#EF4444', fontSize: 11, marginTop: 4 }}>{errors.categoryId}</p>}
              </div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, letterSpacing: '0.03em' }}>
                Subcategoría
              </label>
              <select
                value={form.subcategoryId}
                onChange={e => set('subcategoryId')(e.target.value)}
                disabled={!form.categoryId}
                style={{
                  width: '100%', height: 40, border: '1.5px solid #E2E8F0',
                  borderRadius: 8, padding: '0 12px', fontSize: 14,
                  color: '#1E293B', background: '#FAFBFD', fontFamily: 'Inter, sans-serif',
                  opacity: !form.categoryId ? 0.5 : 1,
                }}
              >
                <option value="">Sin subcategoría</option>
                {subcats.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div style={gridTwo}>
            <div>
              <Field label="SKU" name="sku" value={form.sku} onChange={set('sku')} required placeholder="Ej: POS-SODA-350" hint="Código único del producto" />
              {errors.sku && <p style={{ color: '#EF4444', fontSize: 11, marginTop: -14, marginBottom: 10 }}>{errors.sku}</p>}
            </div>
            <Field label="País de origen" name="countryOfOrigin" value={form.countryOfOrigin} onChange={set('countryOfOrigin')} placeholder="Ej: Colombia" />
          </div>

          <TextAreaField label="Descripción (Español)" name="description" value={form.description} onChange={set('description')} placeholder="Describe el producto, sus características, usos..." />
          <TextAreaField label="Description (English)" name="descriptionEn" value={form.descriptionEn} onChange={set('descriptionEn')} placeholder="Describe the product in English..." />

          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '16px 20px', marginBottom: 18 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 12, letterSpacing: '0.03em' }}>ETIQUETAS / BADGES</p>
            <Toggle label="Producto Nuevo" checked={form.isNew} onChange={set('isNew')} hint="Muestra el badge 'Nuevo' en el catálogo" />
            <Toggle label="Top Seller" checked={form.isTopSeller} onChange={set('isTopSeller')} hint="Muestra el badge 'Top Seller' en el catálogo" />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, letterSpacing: '0.03em' }}>
              Estado del producto
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              {(['ACTIVE', 'HIDDEN'] as const).map(s => (
                <label key={s} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
                  border: `1.5px solid ${form.status === s ? '#1F3A93' : '#E2E8F0'}`,
                  background: form.status === s ? 'rgba(31,58,147,0.06)' : '#FAFBFD',
                  fontSize: 13, fontWeight: form.status === s ? 600 : 400,
                  color: form.status === s ? '#1F3A93' : '#64748B',
                }}>
                  <input type="radio" name="status" value={s} checked={form.status === s} onChange={() => set('status')(s)} style={{ display: 'none' }} />
                  {s === 'ACTIVE' ? '✅ Activo' : '👁️ Oculto'}
                </label>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ─── TAB: Imágenes ─────────────────────────────────────────────────── */}
      {activeTab === 'media' && (
        <div>
          {!isEdit && (
            <div style={{ background: '#FFF8E1', border: '1px solid #FCD34D', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#92400E' }}>
              💡 Las imágenes se pueden agregar después de crear el producto. Guarda el producto primero y luego sube las imágenes desde la pantalla de edición.
            </div>
          )}
          {isEdit && (
            <ImageUploader
              savedImages={product?.images ?? []}
              onUpload={handleImageUpload}
              onDelete={handleImageDelete}
              onReorder={handleImageReorder}
            />
          )}
        </div>
      )}

      {/* ─── TAB: Inventario & precios ─────────────────────────────────────── */}
      {activeTab === 'stock' && (
        <>
          <div style={gridTwo}>
            <div>
              <Field
                label="Precio base proveedor (USD)" name="basePrice"
                value={form.basePrice} onChange={set('basePrice')}
                type="number" min="0" placeholder="0.00" required
                hint="Precio de costo desde proveedor"
              />
              {errors.basePrice && <p style={{ color: '#EF4444', fontSize: 11, marginTop: -14, marginBottom: 10 }}>{errors.basePrice}</p>}
            </div>
            <Field label="Stock disponible (cajas)" name="stockQuantity" value={form.stockQuantity} onChange={set('stockQuantity')} type="number" min="0" placeholder="0" />
          </div>

          <div style={gridTwo}>
            <Field label="Unidades por paquete" name="unitsPerPack" value={form.unitsPerPack} onChange={set('unitsPerPack')} type="number" min="1" placeholder="12" hint="Unidades dentro de un paquete" />
            <Field label="Unidades por caja" name="unitsPerCase" value={form.unitsPerCase} onChange={set('unitsPerCase')} type="number" min="1" placeholder="24" hint="Unidades dentro de una caja" />
          </div>

          <div style={gridTwo}>
            <Field label="MOQ (mínimo de orden en cajas)" name="moq" value={form.moq} onChange={set('moq')} type="number" min="1" placeholder="1" hint="Cantidad mínima por orden" />
            <Field label="Peso por unidad (gramos)" name="weight" value={form.weight} onChange={set('weight')} type="number" min="0" placeholder="350" hint="Peso en gramos de una unidad" />
          </div>

          {/* Calculadora visual */}
          {form.basePrice && form.unitsPerCase && (
            <div style={{ background: '#F0F4FF', border: '1px solid #BFCEF5', borderRadius: 10, padding: 16, marginTop: 8 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#1F3A93', marginBottom: 10 }}>📊 Calculadora de márgenes (referencia)</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {[0.15, 0.20, 0.30].map(margin => {
                  const base     = Number(form.basePrice)
                  const salePrice = base * (1 + margin)
                  return (
                    <div key={margin} style={{ background: '#fff', borderRadius: 8, padding: '10px 12px', border: '1px solid #E2E8F0' }}>
                      <p style={{ fontSize: 11, color: '#64748B', margin: 0 }}>Margen {margin * 100}%</p>
                      <p style={{ fontSize: 16, fontWeight: 700, color: '#1F3A93', margin: '4px 0 0' }}>
                        ${salePrice.toFixed(2)}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* ─── Botones ──────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', gap: 12, justifyContent: 'flex-end',
        borderTop: '1px solid #E2E8F0', paddingTop: 20, marginTop: 28,
      }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '10px 24px', borderRadius: 8,
            border: '1.5px solid #E2E8F0', background: '#fff',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            color: '#64748B', fontFamily: 'Inter, sans-serif',
          }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: '10px 28px', borderRadius: 8,
            border: 'none',
            background: isSubmitting ? '#94A3B8' : '#1F3A93',
            color: '#fff', fontSize: 14, fontWeight: 600,
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            fontFamily: 'Inter, sans-serif',
            display: 'flex', alignItems: 'center', gap: 8,
            transition: 'background .15s',
          }}
        >
          {isSubmitting ? (
            <><span style={{ animation: 'spin .8s linear infinite', display: 'inline-block' }}>⟳</span> Guardando...</>
          ) : (
            isEdit ? '💾 Guardar cambios' : '✅ Crear producto'
          )}
        </button>
      </div>
    </form>
  )
}
