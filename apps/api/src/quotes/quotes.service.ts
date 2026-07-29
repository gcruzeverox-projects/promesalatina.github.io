// apps/api/src/quotes/quotes.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService }    from '../prisma/prisma.service'
import { EmailService }     from '../email/email.service'
import { CloudinaryService } from '../storage/cloudinary.service'
import { CreateQuoteDto }   from './dto/create-quote.dto'
import { UpdateQuoteDto }   from './dto/update-quote.dto'

@Injectable()
export class QuotesService {
  constructor(
    private prisma:     PrismaService,
    private email:      EmailService,
    private cloudinary: CloudinaryService,
  ) {}

  async findAll(filters: { search?: string; page?: number; limit?: number }) {
    const { search, page = 1, limit = 20 } = filters
    const where: Record<string, any> = {}
    if (search) {
      where.OR = [
        { quoteNumber: { contains: search, mode: 'insensitive' } },
        { order: { guestBusiness: { contains: search, mode: 'insensitive' } } },
        { order: { guestEmail:    { contains: search, mode: 'insensitive' } } },
      ]
    }
    const [data, total] = await Promise.all([
      this.prisma.quote.findMany({
        where,
        include: {
          order:     { include: { user: true } },
          createdBy: { select: { id: true, name: true, email: true } },
          items:     { include: { product: true }, orderBy: { id: 'asc' } },
        },
        skip:    (page - 1) * limit,
        take:    limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.quote.count({ where }),
    ])
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findOne(id: string) {
    const quote = await this.prisma.quote.findUnique({
      where:   { id },
      include: {
        order:     { include: { user: true, items: { include: { product: true } } } },
        createdBy: { select: { id: true, name: true, email: true } },
        items:     { include: { product: true }, orderBy: { id: 'asc' } },
      },
    })
    if (!quote) throw new NotFoundException('Cotización no encontrada')
    return quote
  }

  async create(dto: CreateQuoteDto, createdById: string) {
    const subtotal = (dto.items ?? []).reduce(
      (acc: number, item: any) => acc + item.salePrice * item.quantity, 0
    )
    const total    = subtotal + (dto.fees ?? 0)
    const validUntil = new Date()
    validUntil.setDate(validUntil.getDate() + (dto.validDays ?? 7))

    return this.prisma.quote.create({
      data: {
        orderId:         dto.orderId,
        createdById,
        validUntil,
        profitPercent:   dto.profitPercent   ?? 0,
        bottlingPercent: dto.bottlingPercent ?? 0,
        fees:            dto.fees            ?? 0,
        notes:           dto.notes,
        subtotal,
        total,
        items: {
          create: (dto.items ?? []).map((item: any) => ({
            productId:     item.productId,
            quantity:      item.quantity,
            unitType:      item.unitType,
            supplierPrice: item.supplierPrice,
            bottlingCost:  item.bottlingCost ?? 0,
            salePrice:     item.salePrice,
            subtotal:      item.salePrice * item.quantity,
            isAvailable:   item.isAvailable ?? true,
            deliveryDays:  item.deliveryDays ? Number(item.deliveryDays) : null,
            notes:         item.notes,
          })),
        },
      },
      include: {
        order:     { include: { user: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        items:     { include: { product: true } },
      },
    })
  }

  async update(id: string, dto: UpdateQuoteDto) {
    await this.findOne(id)
    const subtotal = dto.items
      ? (dto.items as any[]).reduce((acc, i) => acc + i.salePrice * i.quantity, 0)
      : undefined
    const total = subtotal !== undefined ? subtotal + (dto.fees ?? 0) : undefined
    const validUntil = (dto as any).validDays
      ? (() => { const d = new Date(); d.setDate(d.getDate() + Number((dto as any).validDays)); return d })()
      : undefined

    if (dto.items) {
      await this.prisma.quoteItem.deleteMany({ where: { quoteId: id } })
    }

    return this.prisma.quote.update({
      where: { id },
      data: {
        ...(dto.profitPercent   !== undefined && { profitPercent:   dto.profitPercent }),
        ...(dto.bottlingPercent !== undefined && { bottlingPercent: dto.bottlingPercent }),
        ...(dto.fees            !== undefined && { fees:            dto.fees }),
        ...(dto.notes           !== undefined && { notes:           dto.notes }),
        ...(subtotal            !== undefined && { subtotal }),
        ...(total               !== undefined && { total }),
        ...(validUntil          !== undefined && { validUntil }),
        ...(dto.items && {
          items: {
            create: (dto.items as any[]).map((item) => ({
              productId:     item.productId,
              quantity:      item.quantity,
              unitType:      item.unitType,
              supplierPrice: item.supplierPrice,
              salePrice:     item.salePrice,
              subtotal:      item.salePrice * item.quantity,
              isAvailable:   item.isAvailable ?? true,
              deliveryDays:  item.deliveryDays ? Number(item.deliveryDays) : null,
              notes:         item.notes,
            })),
          },
        }),
        updatedAt: new Date(),
      },
      include: {
        order:     { include: { user: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        items:     { include: { product: true } },
      },
    })
  }

  async sendQuote(id: string) {
    const quote = await this.findOne(id) as any
    const pdfBuffer = await this.generatePdf(quote)

    let pdfUrl = ''
    try {
      const uploaded = await this.cloudinary.uploadPdf(
        pdfBuffer,
        `cotizacion-${quote.quoteNumber}`
      )
      pdfUrl = uploaded.url
    } catch { /* Continuar sin URL pública si falla Cloudinary */ }

    const clientEmail = quote.order?.user?.email ?? quote.order?.guestEmail
    if (!clientEmail) throw new ForbiddenException('La orden no tiene email de cliente')

    await this.email.sendQuotePDF(clientEmail, quote, pdfBuffer)

    await this.prisma.quote.update({
      where: { id },
      data:  { sentAt: new Date(), pdfUrl, updatedAt: new Date() },
    })
    await this.prisma.order.update({
      where: { id: quote.orderId },
      data:  { status: 'ENVIADA' as any },
    })

    return { pdfUrl, sentAt: new Date().toISOString() }
  }

  async getPdfBuffer(id: string): Promise<Buffer> {
    const quote = await this.findOne(id)
    return this.generatePdf(quote)
  }

  async remove(id: string) {
    await this.findOne(id)
    await this.prisma.quoteItem.deleteMany({ where: { quoteId: id } })
    await this.prisma.quote.delete({ where: { id } })
  }

  private async generatePdf(quote: any): Promise<Buffer> {
    const { renderToBuffer }   = await import('@react-pdf/renderer')
    // Importar el .ts (sin JSX) en lugar de .tsx
    const { QuotePdfTemplate } = await import('./pdf/quote-pdf')
    const ReactModule = await import('react')
    const React = (ReactModule as any).default ?? ReactModule

    const element = React.createElement(QuotePdfTemplate, { quote })
    const buffer  = await renderToBuffer(element as any)
    return buffer as unknown as Buffer
  }
}
