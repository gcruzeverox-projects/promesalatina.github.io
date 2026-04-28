// apps/api/src/products/products.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService }    from '../prisma/prisma.service'
import { CloudinaryService } from '../storage/cloudinary.service'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { ProductFiltersDto } from './dto/product-filters.dto'

// Enum local para no depender de @prisma/client en tiempo de compilación
type ProductStatus = 'ACTIVE' | 'HIDDEN' | 'DELETED'

const PRODUCT_INCLUDE = {
  category:    true,
  subcategory: true,
  images: {
    orderBy: { order: 'asc' as const },
  },
} as const

@Injectable()
export class ProductsService {
  constructor(
    private prisma:     PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async findAll(filters: ProductFiltersDto) {
    const {
      search, categoryId, subcategoryId,
      status = 'ACTIVE', isNew, isTopSeller,
      page = 1, limit = 20,
    } = filters

    const where: Record<string, any> = {}

    if (status !== 'ALL') where.status = status
    if (search) {
      where.OR = [
        { name:        { contains: search, mode: 'insensitive' } },
        { nameEn:      { contains: search, mode: 'insensitive' } },
        { sku:         { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (categoryId)    where.categoryId    = categoryId
    if (subcategoryId) where.subcategoryId = subcategoryId
    if (isNew        !== undefined) where.isNew       = isNew
    if (isTopSeller  !== undefined) where.isTopSeller = isTopSeller

    const skip = (Number(page) - 1) * Number(limit)

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: PRODUCT_INCLUDE,
        skip,
        take:    Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ])

    const dataWithMain = data.map((p: any) => ({
      ...p,
      mainImageUrl: p.images[0]?.url ?? null,
    }))

    return {
      data:       dataWithMain,
      total,
      page:       Number(page),
      limit:      Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    }
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where:   { id },
      include: PRODUCT_INCLUDE,
    })
    if (!product) throw new NotFoundException(`Producto ${id} no encontrado`)
    return { ...(product as any), mainImageUrl: (product as any).images[0]?.url ?? null }
  }

  async create(dto: CreateProductDto) {
    const existing = await this.prisma.product.findUnique({ where: { sku: dto.sku } })
    if (existing) throw new ConflictException(`El SKU "${dto.sku}" ya existe`)

    return this.prisma.product.create({
      data: {
        name:            dto.name,
        nameEn:          dto.nameEn,
        description:     dto.description,
        descriptionEn:   dto.descriptionEn,
        sku:             dto.sku,
        weight:          dto.weight,
        unitsPerPack:    dto.unitsPerPack,
        unitsPerCase:    dto.unitsPerCase,
        moq:             dto.moq,
        basePrice:       dto.basePrice,
        stockQuantity:   dto.stockQuantity ?? 0,
        categoryId:      dto.categoryId,
        subcategoryId:   dto.subcategoryId ?? null,
        isNew:           dto.isNew ?? false,
        isTopSeller:     dto.isTopSeller ?? false,
        countryOfOrigin: dto.countryOfOrigin,
        status:          (dto.status ?? 'ACTIVE') as any,
      },
      include: PRODUCT_INCLUDE,
    })
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id)
    if (dto.sku) {
      const existing = await this.prisma.product.findFirst({
        where: { sku: dto.sku, NOT: { id } },
      })
      if (existing) throw new ConflictException(`El SKU "${dto.sku}" ya existe`)
    }
    return this.prisma.product.update({
      where: { id },
      data:  { ...(dto as any), updatedAt: new Date() },
      include: PRODUCT_INCLUDE,
    })
  }

  async updateStatus(id: string, status: ProductStatus) {
    await this.findOne(id)
    return this.prisma.product.update({
      where: { id },
      data:  { status: status as any, updatedAt: new Date() },
      include: PRODUCT_INCLUDE,
    })
  }

  async remove(id: string) {
    await this.findOne(id)
    return this.prisma.product.update({
      where: { id },
      data:  { status: 'DELETED' as any, updatedAt: new Date() },
    })
  }

  async duplicate(id: string) {
    const original = await this.findOne(id) as any
    const newSku   = `${original.sku}-COPY-${Date.now().toString(36).toUpperCase()}`
    return this.prisma.product.create({
      data: {
        name:            `${original.name} (Copia)`,
        nameEn:          original.nameEn ? `${original.nameEn} (Copy)` : null,
        description:     original.description,
        descriptionEn:   original.descriptionEn,
        sku:             newSku,
        weight:          original.weight,
        unitsPerPack:    original.unitsPerPack,
        unitsPerCase:    original.unitsPerCase,
        moq:             original.moq,
        basePrice:       original.basePrice,
        stockQuantity:   0,
        categoryId:      original.categoryId,
        subcategoryId:   original.subcategoryId,
        isNew:           false,
        isTopSeller:     false,
        countryOfOrigin: original.countryOfOrigin,
        status:          'HIDDEN' as any,
      },
      include: PRODUCT_INCLUDE,
    })
  }

  async uploadImages(productId: string, files: Express.Multer.File[]) {
    await this.findOne(productId)
    const lastImage = await this.prisma.productImage.findFirst({
      where:   { productId },
      orderBy: { order: 'desc' },
    })
    let nextOrder = (lastImage?.order ?? -1) + 1

    const uploads = await Promise.all(
      files.map(file => this.cloudinary.uploadProductImage(file.buffer, file.originalname))
    )
    await this.prisma.productImage.createMany({
      data: uploads.map(upload => ({
        productId,
        url:     upload.url,
        altText: upload.publicId,
        order:   nextOrder++,
      })),
    })
    return this.findOne(productId)
  }

  async deleteImage(productId: string, imageId: string) {
    const image = await this.prisma.productImage.findFirst({
      where: { id: imageId, productId },
    })
    if (!image) throw new NotFoundException('Imagen no encontrada')
    if (image.altText) await this.cloudinary.deleteImage(image.altText).catch(() => {})
    await this.prisma.productImage.delete({ where: { id: imageId } })

    const remaining = await this.prisma.productImage.findMany({
      where: { productId }, orderBy: { order: 'asc' },
    })
    await Promise.all(
      remaining.map((img: any, i: number) =>
        this.prisma.productImage.update({ where: { id: img.id }, data: { order: i } })
      )
    )
    return this.findOne(productId)
  }

  async reorderImages(productId: string, imageIds: string[]) {
    await Promise.all(
      imageIds.map((imgId, index) =>
        this.prisma.productImage.updateMany({
          where: { id: imgId, productId },
          data:  { order: index },
        })
      )
    )
    return this.findOne(productId)
  }
}
