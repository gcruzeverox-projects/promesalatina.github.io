// lib/api-admin.ts
// Cliente HTTP para el panel de administración
// Todas las peticiones incluyen el token JWT de la sesión activa

import type {
  Product,
  ProductFormData,
  ProductFilters,
  PaginatedProducts,
  Category,
  ProductStatus,
} from '@/types/product'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

// ─── Helper: obtener token del localStorage ───────────────────────────────────
function getAuthHeaders(): HeadersInit {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('pl_token') : null
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error desconocido' }))
    throw new Error(error.message ?? `HTTP ${res.status}`)
  }
  return res.json()
}

// ─── PRODUCTOS ────────────────────────────────────────────────────────────────

export async function getProducts(filters: ProductFilters = {}): Promise<PaginatedProducts> {
  const params = new URLSearchParams()
  if (filters.search)     params.set('search', filters.search)
  if (filters.categoryId) params.set('categoryId', filters.categoryId)
  if (filters.status && filters.status !== 'ALL') params.set('status', filters.status)
  if (filters.page)       params.set('page', String(filters.page))
  if (filters.limit)      params.set('limit', String(filters.limit ?? 20))

  const res = await fetch(`${BASE_URL}/api/products?${params}`, {
    headers: getAuthHeaders(),
  })
  return handleResponse<PaginatedProducts>(res)
}

export async function getProduct(id: string): Promise<Product> {
  const res = await fetch(`${BASE_URL}/api/products/${id}`, {
    headers: getAuthHeaders(),
  })
  return handleResponse<Product>(res)
}

export async function createProduct(data: Partial<ProductFormData>): Promise<Product> {
  const res = await fetch(`${BASE_URL}/api/products`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  return handleResponse<Product>(res)
}

export async function updateProduct(id: string, data: Partial<ProductFormData>): Promise<Product> {
  const res = await fetch(`${BASE_URL}/api/products/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  return handleResponse<Product>(res)
}

export async function updateProductStatus(id: string, status: ProductStatus): Promise<Product> {
  const res = await fetch(`${BASE_URL}/api/products/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  })
  return handleResponse<Product>(res)
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/products/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  return handleResponse<void>(res)
}

export async function duplicateProduct(id: string): Promise<Product> {
  const res = await fetch(`${BASE_URL}/api/products/${id}/duplicate`, {
    method: 'POST',
    headers: getAuthHeaders(),
  })
  return handleResponse<Product>(res)
}

// ─── IMÁGENES ─────────────────────────────────────────────────────────────────

export async function uploadProductImages(
  productId: string,
  files: File[]
): Promise<Product> {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('pl_token') : null

  const formData = new FormData()
  files.forEach((file) => formData.append('images', file))

  const res = await fetch(`${BASE_URL}/api/products/${productId}/images`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })
  return handleResponse<Product>(res)
}

export async function deleteProductImage(
  productId: string,
  imageId: string
): Promise<void> {
  const res = await fetch(
    `${BASE_URL}/api/products/${productId}/images/${imageId}`,
    { method: 'DELETE', headers: getAuthHeaders() }
  )
  return handleResponse<void>(res)
}

export async function reorderProductImages(
  productId: string,
  imageIds: string[]
): Promise<void> {
  const res = await fetch(
    `${BASE_URL}/api/products/${productId}/images/reorder`,
    {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ imageIds }),
    }
  )
  return handleResponse<void>(res)
}

// ─── CATEGORÍAS ───────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${BASE_URL}/api/categories`, {
    headers: getAuthHeaders(),
  })
  return handleResponse<Category[]>(res)
}
