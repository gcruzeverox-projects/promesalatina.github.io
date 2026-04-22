// apps/api/src/orders/orders.module.ts
import { Module } from '@nestjs/common'
import { OrdersController } from './orders.controller'
import { OrdersService } from './orders.service'
import { EmailModule } from '../email/email.module'

@Module({
  imports:     [EmailModule],
  controllers: [OrdersController],
  providers:   [OrdersService],
  exports:     [OrdersService],
})
export class OrdersModule {}

// ─────────────────────────────────────────────────────────────────────────────

// apps/api/src/orders/orders.service.ts
import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: any) {
    const subtotal = dto.items.reduce((acc: number, i: any) => acc + i.unitPrice * i.quantity, 0)
    return this.prisma.order.create({
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
      include: { items: { include: { product: true } } },
    })
  }

  findAll(filters?: any) {
    return this.prisma.order.findMany({
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
    return this.prisma.order.update({ where: { id }, data: { status: status as any } })
  }
}

// ─────────────────────────────────────────────────────────────────────────────

// apps/api/src/orders/orders.controller.ts
import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common'
import { OrdersService } from './orders.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard, Roles } from '../auth/guards/roles.guard'

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() dto: any) { return this.ordersService.create(dto) }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'VENTAS')
  findAll() { return this.ordersService.findAll() }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) { return this.ordersService.findOne(id) }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'VENTAS')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.ordersService.updateStatus(id, status)
  }
}
