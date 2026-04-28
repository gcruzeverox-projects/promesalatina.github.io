// types/product.ts
// Tipos compartidos entre frontend y backend para el módulo de productos

export type ProductStatus = 'ACTIVE' | 'HIDDEN' | 'DELETED'

export interface ProductImage {
  id: string
  url: string
  altText?: string
  order: number
  productId: string
}

export interface Category {
  id: string
  name: string
  nameEn: string
  slug: string
  icon?: string
  subcategories: Subcategory[]
}

export interface Subcategory {
  id: string
  name: string
  nameEn: string
  slug: string
  categoryId: string
}

export interface Product {
  id: string
  name: string
  nameEn?: string
  description?: string
  descriptionEn?: string
  sku: string
  weight?: number
  unitsPerPack: number
  unitsPerCase: number
  moq: number
  basePrice: number
  status: ProductStatus
  stockQuantity: number
  mainImageUrl?: string
  images: ProductImage[]
  categoryId: string
  category?: Category
  subcategoryId?: string
  subcategory?: Subcategory
  isNew: boolean
  isTopSeller: boolean
  countryOfOrigin?: string
  createdAt: string
  updatedAt: string
}

export interface ProductFormData {
  name: string
  nameEn: string
  description: string
  descriptionEn: string
  sku: string
  weight: string
  unitsPerPack: string
  unitsPerCase: string
  moq: string
  basePrice: string
  stockQuantity: string
  categoryId: string
  subcategoryId: string
  isNew: boolean
  isTopSeller: boolean
  countryOfOrigin: string
  status: ProductStatus
}

export interface ProductFilters {
  search?: string
  categoryId?: string
  status?: ProductStatus | 'ALL'
  page?: number
  limit?: number
}

export interface PaginatedProducts {
  data: Product[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// DTO para crear/actualizar desde el form
export interface CreateProductDto extends Omit<ProductFormData, 'weight' | 'unitsPerPack' | 'unitsPerCase' | 'moq' | 'basePrice' | 'stockQuantity'> {
  weight?: number
  unitsPerPack: number
  unitsPerCase: number
  moq: number
  basePrice: number
  stockQuantity: number
}
