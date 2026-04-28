// apps/web/store/cart.ts
// Zustand store del carrito B2B — persiste en localStorage
// Maneja items por caja o paquete, cantidades, y estado del checkout

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type UnitType = 'caja' | 'paquete'

export interface CartItem {
  productId:    string
  name:         string
  nameEn:       string
  sku:          string
  unitType:     UnitType
  quantity:     number
  basePrice:    number          // precio base del catálogo
  imageUrl:     string
  unitsPerCase: number
  unitsPerPack: number
  moq:          number          // mínimo de orden en cajas
  categoryName: string
  stockQuantity: number
}

interface CartStore {
  items:          CartItem[]
  checkoutNotes:  string
  // Acciones
  addItem:        (item: CartItem) => void
  removeItem:     (productId: string) => void
  updateQuantity: (productId: string, qty: number) => void
  updateUnitType: (productId: string, type: UnitType) => void
  setNotes:       (notes: string) => void
  clearCart:      () => void
  // Computed
  totalItems:     () => number
  subtotal:       () => number
  itemCount:      () => number
  isInCart:       (productId: string) => boolean
  getItem:        (productId: string) => CartItem | undefined
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items:         [],
      checkoutNotes: '',

      addItem: (item) => set(state => {
        const existing = state.items.find(i => i.productId === item.productId)
        if (existing) {
          // Si ya existe, incrementar cantidad
          return {
            items: state.items.map(i =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          }
        }
        return { items: [...state.items, item] }
      }),

      removeItem: (productId) => set(state => ({
        items: state.items.filter(i => i.productId !== productId),
      })),

      updateQuantity: (productId, qty) => set(state => ({
        items: state.items.map(i =>
          i.productId === productId ? { ...i, quantity: Math.max(i.moq, qty) } : i
        ),
      })),

      updateUnitType: (productId, type) => set(state => ({
        items: state.items.map(i =>
          i.productId === productId ? { ...i, unitType: type } : i
        ),
      })),

      setNotes:  (notes) => set({ checkoutNotes: notes }),
      clearCart: () => set({ items: [], checkoutNotes: '' }),

      totalItems: () => get().items.reduce((acc, i) => acc + i.quantity, 0),
      subtotal:   () => get().items.reduce((acc, i) => acc + i.basePrice * i.quantity, 0),
      itemCount:  () => get().items.length,
      isInCart:   (id) => get().items.some(i => i.productId === id),
      getItem:    (id) => get().items.find(i => i.productId === id),
    }),
    {
      name:    'pl-cart-v1',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : {
          getItem:    () => null,
          setItem:    () => {},
          removeItem: () => {},
        }
      ),
    }
  )
)
