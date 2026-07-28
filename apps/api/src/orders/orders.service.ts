// apps/api/src/orders/orders.service.ts
import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { EmailService } from '../email/email.service'

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private email: EmailService,
  ) {}

  async create(dto: any) {
    const subtotal = dto.items.reduce(
      (acc: number, i: any) => acc + i.unitPrice * i.quantity, 0
    )

    const order = await this.prisma.order.create({
      data: {
        userId:        dto.userId ?? null,
        guestName:     dto.guestName,
        guestEmail:    dto.guestEmail,
        guestPhone:    dto.guestPhone,
        guestBusiness: dto.guestBusiness,
        guestAddress:  dto.guestAddress,
        subtotal,
        total:         subtotal,
        notes:         dto.notes,
        items: {
          create: dto.items.map((item: any) => ({
            productId: item.productId,
            quantity:  item.quantity,
            unitType:  item.unitType ?? 'caja',
            unitPrice: item.unitPrice,
            subtotal:  item.unitPrice * item.quantity,
          })),
        },
      },
      include: { items: { include: { product: true } }, user: true },
    })

    // ── Enviar emails ──────────────────────────────────────────────────────
    const clientEmail = order.guestEmail ?? order.user?.email
    if (clientEmail) {
      this.email.sendOrderConfirmation(clientEmail, order).catch(() => {})
    }
    this.email.sendNewOrderAlert(order).catch(() => {})

    return order
  }

  findAll(filters?: { status?: string }) {
    const where: any = {}
    if (filters?.status) where.status = filters.status
    return this.prisma.order.findMany({
      where,
      include: { items: { include: { product: true } }, user: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where:   { id },
      include: { items: { include: { product: true } }, user: true },
    })
    if (!order) throw new NotFoundException('Orden no encontrada')
    return order
  }

  updateStatus(id: string, status: string) {
    return this.prisma.order.update({
      where: { id },
      data:  { status: status as any },
    })
  }
}
