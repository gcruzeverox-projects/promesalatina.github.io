// apps/api/src/quotes/quotes.service.ts
// Servicio de cotizaciones:
// - CRUD completo
// - Cálculo automático de totales
// - Generación de PDF con react-pdf
// - Envío por email con Resend (adjunto PDF)
// - Subida del PDF a Cloudinary para link permanente

import {
  Injectable, NotFoundException, ForbiddenException
} from '@nestjs/common'
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

  // ── Listar ────────────────────────────────────────────────────────────────
  async findAll(filters: { search?: string; page?: number; limit?: number }) {
    const { search, page = 1, limit = 20 } = filters
    const where: any = {}
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

  // ── Detalle ───────────────────────────────────────────────────────────────
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

  // ── Crear ─────────────────────────────────────────────────────────────────
  async create(dto: CreateQuoteDto, createdById: string) {
    // Calcular subtotal y total desde los items
    const subtotal = dto.items.reduce(
      (acc, item) => acc + item.salePrice * item.quantity, 0
    )
    const total = subtotal + (dto.fees ?? 0)

    const validUntil = new Date()
    validUntil.setDate(validUntil.getDate() + (dto.validDays ?? 7))

    const quote = await this.prisma.quote.create({
      data: {
        orderId:         dto.orderId,
        createdById,
        validUntil,
        profitPercent:   dto.profitPercent ?? 0,
        bottlingPercent: dto.bottlingPercent ?? 0,
        fees:            dto.fees ?? 0,
        notes:           dto.notes,
        subtotal,
        total,
        items: {
          create: dto.items.map(item => ({
            productId:    item.productId,
            quantity:     item.quantity,
            unitType:     item.unitType,
            supplierPrice: item.supplierPrice,
            salePrice:    item.salePrice,
            subtotal:     item.salePrice * item.quantity,
            isAvailable:  item.isAvailable ?? true,
            deliveryDays: item.deliveryDays ? Number(item.deliveryDays) : null,
            notes:        item.notes,
          })),
        },
      },
      include: {
        order:     { include: { user: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        items:     { include: { product: true } },
      },
    })

    return quote
  }

  // ── Actualizar ────────────────────────────────────────────────────────────
  async update(id: string, dto: UpdateQuoteDto) {
    await this.findOne(id)

    const subtotal = dto.items
      ? dto.items.reduce((acc, i) => acc + i.salePrice * i.quantity, 0)
      : undefined
    const total = subtotal !== undefined ? subtotal + (dto.fees ?? 0) : undefined

    // Recalcular validUntil si cambian los días
    const validUntil = dto.validDays
      ? (() => { const d = new Date(); d.setDate(d.getDate() + dto.validDays!); return d })()
      : undefined

    // Eliminar items anteriores y recrear
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
            create: dto.items.map(item => ({
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

  // ── Generar PDF + enviar por email ────────────────────────────────────────
  async sendQuote(id: string) {
    const quote = await this.findOne(id)

    // Generar PDF
    const pdfBuffer = await this.generatePdf(quote)

    // Subir PDF a Cloudinary para link permanente
    let pdfUrl = ''
    try {
      const uploaded = await this.cloudinary.uploadPdf(
        pdfBuffer,
        `cotizacion-${quote.quoteNumber}`
      )
      pdfUrl = uploaded.url
    } catch {
      // Si falla Cloudinary, continuar sin URL pública
    }

    // Determinar email del cliente
    const clientEmail = quote.order.user?.email ?? quote.order.guestEmail
    if (!clientEmail) throw new ForbiddenException('La orden no tiene email de cliente')

    const clientName  = quote.order.user?.businessName ?? quote.order.user?.name
                      ?? quote.order.guestBusiness ?? quote.order.guestName ?? 'Cliente'

    // Enviar email con PDF adjunto
    await this.email.sendQuotePDF(clientEmail, quote, pdfBuffer)

    // Marcar como enviada
    await this.prisma.quote.update({
      where: { id },
      data:  { sentAt: new Date(), pdfUrl, updatedAt: new Date() },
    })

    // Actualizar estado de la orden a ENVIADA
    await this.prisma.order.update({
      where: { id: quote.orderId },
      data:  { status: 'ENVIADA' },
    })

    return { pdfUrl, sentAt: new Date().toISOString() }
  }

  // ── Descargar PDF sin enviar ───────────────────────────────────────────────
  async getPdfBuffer(id: string): Promise<Buffer> {
    const quote = await this.findOne(id)
    return this.generatePdf(quote)
  }

  // ── Eliminar ──────────────────────────────────────────────────────────────
  async remove(id: string) {
    await this.findOne(id)
    await this.prisma.quoteItem.deleteMany({ where: { quoteId: id } })
    await this.prisma.quote.delete({ where: { id } })
  }

  // ── Generador de PDF interno ───────────────────────────────────────────────
  // Genera un PDF profesional usando @react-pdf/renderer.
  // El template QuotePdfTemplate está en quotes/pdf/quote-pdf.tsx
  private async generatePdf(quote: any): Promise<Buffer> {
    // Dynamic import para evitar SSR issues con react-pdf
    const { renderToBuffer }  = await import('@react-pdf/renderer')
    const { QuotePdfTemplate } = await import('./pdf/quote-pdf')
    const React = await import('react')

    const buffer = await renderToBuffer(
      React.createElement(QuotePdfTemplate, { quote })
    )
    return buffer as unknown as Buffer
  }
}
