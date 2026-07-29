// apps/web/types/quote.ts
// Tipos compartidos para el módulo de cotizaciones

import type { Product } from './product'

export type QuoteStatus = 'BORRADOR' | 'ENVIADA' | 'ACEPTADA' | 'RECHAZADA' | 'VENCIDA'

export interface QuoteItem {
  id: string
  quoteId: string
  productId: string
  product: Product
  quantity: number
  unitType: 'caja' | 'paquete'
  supplierPrice: number   // precio proveedor validado
  salePrice: number       // precio final para cliente
  subtotal: number
  isAvailable: boolean
  deliveryDays?: number
  notes?: string
}

export interface Quote {
  id: string
  quoteNumber: string
  orderId: string
  order: {
    id: string
    orderNumber: string
    guestName?: string
    guestEmail?: string
    guestPhone?: string
    guestBusiness?: string
    guestAddress?: string
    notes?: string
    user?: {
      id: string
      name: string
      email: string
      phone?: string
      businessName?: string
      address?: string
    }
  }
  createdById: string
  createdBy: { id: string; name: string; email: string }
  validUntil: string
  items: QuoteItem[]
  profitPercent: number
  bottlingPercent: number
  subtotal: number
  fees: number
  total: number
  notes?: string
  pdfUrl?: string
  sentAt?: string
  createdAt: string
  updatedAt: string
}

export interface QuoteItemForm {
  productId: string
  productName: string
  productSku: string
  quantity: number
  unitType: 'caja' | 'paquete'
  supplierPrice: string
  bottlingCost:  number
  salePrice: string
  isAvailable: boolean
  deliveryDays: string
  notes: string
}

export interface QuoteFormData {
  orderId: string
  validDays: string           // días de vigencia desde hoy
  profitPercent: string
  bottlingPercent: string
  fees: string
  notes: string
  items: QuoteItemForm[]
}

export interface QuoteFilters {
  search?: string
  status?: QuoteStatus | 'ALL'
  page?: number
  limit?: number
}

export interface PaginatedQuotes {
  data: Quote[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Datos del cliente consolidados desde orden
export interface ClientInfo {
  name: string
  email: string
  phone: string
  businessName: string
  address: string
}

export function getClientInfo(quote: Quote): ClientInfo {
  const u = quote.order.user
  return {
    name:         u?.name         ?? quote.order.guestName         ?? '',
    email:        u?.email        ?? quote.order.guestEmail        ?? '',
    phone:        u?.phone        ?? quote.order.guestPhone        ?? '',
    businessName: u?.businessName ?? quote.order.guestBusiness     ?? '',
    address:      u?.address      ?? quote.order.guestAddress      ?? '',
  }
}
