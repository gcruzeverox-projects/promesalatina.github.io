// apps/web/lib/api-quotes.ts
// Cliente HTTP para el módulo de cotizaciones
// Extiende api-admin.ts con los endpoints del módulo de ventas

import type { Quote, QuoteFormData, QuoteFilters, PaginatedQuotes } from '@/types/quote'
import type { Order } from '@/types/order'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('pl_token') : null
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }))
    throw new Error(err.message ?? `HTTP ${res.status}`)
  }
  return res.json()
}

// ─── ÓRDENES ─────────────────────────────────────────────────────────────────
// Obtener órdenes pendientes de cotizar (status RECIBIDA)
export async function getPendingOrders(): Promise<Order[]> {
  const res = await fetch(`${BASE}/api/orders?status=RECIBIDA`, { headers: authHeaders() })
  return handle<Order[]>(res)
}

export async function getOrder(id: string): Promise<Order> {
  const res = await fetch(`${BASE}/api/orders/${id}`, { headers: authHeaders() })
  return handle<Order>(res)
}

export async function updateOrderStatus(id: string, status: string): Promise<Order> {
  const res = await fetch(`${BASE}/api/orders/${id}/status`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  })
  return handle<Order>(res)
}

// ─── COTIZACIONES ─────────────────────────────────────────────────────────────
export async function getQuotes(filters: QuoteFilters = {}): Promise<PaginatedQuotes> {
  const p = new URLSearchParams()
  if (filters.search) p.set('search', filters.search)
  if (filters.status && filters.status !== 'ALL') p.set('status', filters.status)
  if (filters.page)   p.set('page', String(filters.page))
  if (filters.limit)  p.set('limit', String(filters.limit ?? 20))
  const res = await fetch(`${BASE}/api/quotes?${p}`, { headers: authHeaders() })
  return handle<PaginatedQuotes>(res)
}

export async function getQuote(id: string): Promise<Quote> {
  const res = await fetch(`${BASE}/api/quotes/${id}`, { headers: authHeaders() })
  return handle<Quote>(res)
}

export async function createQuote(data: QuoteFormData): Promise<Quote> {
  const res = await fetch(`${BASE}/api/quotes`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  return handle<Quote>(res)
}

export async function updateQuote(id: string, data: Partial<QuoteFormData>): Promise<Quote> {
  const res = await fetch(`${BASE}/api/quotes/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  return handle<Quote>(res)
}

// Genera PDF y envía por email al cliente
export async function sendQuote(id: string): Promise<{ pdfUrl: string; sentAt: string }> {
  const res = await fetch(`${BASE}/api/quotes/${id}/send`, {
    method: 'POST',
    headers: authHeaders(),
  })
  return handle<{ pdfUrl: string; sentAt: string }>(res)
}

// Descargar PDF sin enviar
export async function downloadQuotePdf(id: string): Promise<Blob> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('pl_token') : null
  const res = await fetch(`${BASE}/api/quotes/${id}/pdf`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) throw new Error('No se pudo descargar el PDF')
  return res.blob()
}

export async function deleteQuote(id: string): Promise<void> {
  const res = await fetch(`${BASE}/api/quotes/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  return handle<void>(res)
}
