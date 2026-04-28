// apps/web/types/order.ts
export type OrderStatus =
  | 'RECIBIDA'
  | 'COTIZANDO'
  | 'ENVIADA'
  | 'CONFIRMADA'
  | 'SURTIDA'
  | 'CANCELADA'

export interface OrderItem {
  id: string
  productId: string
  product: {
    id: string
    name: string
    sku: string
    mainImageUrl?: string
    basePrice: number
    unitsPerCase: number
    unitsPerPack: number
  }
  quantity: number
  unitType: string
  unitPrice: number
  subtotal: number
}

export interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  userId?: string
  user?: {
    id: string
    name: string
    email: string
    phone?: string
    businessName?: string
    address?: string
    city?: string
    state?: string
  }
  guestName?: string
  guestEmail?: string
  guestPhone?: string
  guestBusiness?: string
  guestAddress?: string
  items: OrderItem[]
  notes?: string
  subtotal: number
  total: number
  createdAt: string
  updatedAt: string
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  RECIBIDA:   { label: 'Recibida',   color: '#1e40af', bg: '#dbeafe' },
  COTIZANDO:  { label: 'Cotizando',  color: '#92400e', bg: '#fef3c7' },
  ENVIADA:    { label: 'Enviada',    color: '#065f46', bg: '#d1fae5' },
  CONFIRMADA: { label: 'Confirmada', color: '#166534', bg: '#dcfce7' },
  SURTIDA:    { label: 'Surtida',    color: '#374151', bg: '#f3f4f6' },
  CANCELADA:  { label: 'Cancelada',  color: '#991b1b', bg: '#fee2e2' },
}
