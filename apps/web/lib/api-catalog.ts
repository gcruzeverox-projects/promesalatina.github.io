// apps/web/lib/api-catalog.ts
// Cliente HTTP para el catálogo público y checkout

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }))
    throw new Error(err.message ?? `HTTP ${res.status}`)
  }
  return res.json()
}

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('pl_token') : null
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

// ── Productos ─────────────────────────────────────────────────────────────────
export async function fetchProducts(params: {
  search?:      string
  categoryId?:  string
  subcategoryId?: string
  isNew?:       boolean
  isTopSeller?: boolean
  page?:        number
  limit?:       number
}) {
  const q = new URLSearchParams()
  if (params.search)        q.set('search',        params.search)
  if (params.categoryId)    q.set('categoryId',    params.categoryId)
  if (params.subcategoryId) q.set('subcategoryId', params.subcategoryId)
  if (params.isNew)         q.set('isNew',         'true')
  if (params.isTopSeller)   q.set('isTopSeller',   'true')
  q.set('page',  String(params.page  ?? 1))
  q.set('limit', String(params.limit ?? 24))
  const res = await fetch(`${BASE}/api/products?${q}`)
  return handle<any>(res)
}

export async function fetchProduct(id: string) {
  const res = await fetch(`${BASE}/api/products/${id}`)
  return handle<any>(res)
}

export async function fetchCategories() {
  const res = await fetch(`${BASE}/api/categories`)
  return handle<any[]>(res)
}

// ── Órdenes (checkout) ────────────────────────────────────────────────────────
export interface CheckoutPayload {
  // Cliente invitado
  guestName?:     string
  guestEmail?:    string
  guestPhone?:    string
  guestBusiness?: string
  guestAddress?:  string
  // Cliente autenticado (se obtiene del token)
  userId?:        string
  notes?:         string
  items: {
    productId: string
    quantity:  number
    unitType:  string
    unitPrice: number
  }[]
}

export async function submitOrder(payload: CheckoutPayload) {
  const res = await fetch(`${BASE}/api/orders`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  })
  return handle<any>(res)
}

export async function fetchMyOrders() {
  const res = await fetch(`${BASE}/api/orders/my`, { headers: authHeaders() })
  return handle<any[]>(res)
}
