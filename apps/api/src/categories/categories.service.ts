// apps/api/src/categories/categories.service.ts
import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.category.findMany({
      include: { subcategories: { orderBy: { order: 'asc' } }, _count: { select: { products: true } } },
      orderBy: { order: 'asc' },
    })
  }

  findOne(id: string) {
    return this.prisma.category.findUnique({
      where:   { id },
      include: { subcategories: true, _count: { select: { products: true } } },
    })
  }

  async create(dto: any) {
    const last = await this.prisma.category.findFirst({ orderBy: { order: 'desc' } })
    return this.prisma.category.create({
      data: {
        name:   dto.name,
        nameEn: dto.nameEn ?? dto.name,
        slug:   dto.slug ?? dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
        icon:   dto.icon ?? '🏷️',
        order:  dto.order ?? (last ? last.order + 1 : 1),
      },
    })
  }

  async update(id: string, dto: any) {
    const cat = await this.prisma.category.findUnique({ where: { id } })
    if (!cat) throw new NotFoundException('Categoría no encontrada')
    return this.prisma.category.update({
      where: { id },
      data: {
        ...(dto.name   && { name:   dto.name }),
        ...(dto.nameEn && { nameEn: dto.nameEn }),
        ...(dto.icon   && { icon:   dto.icon }),
        ...(dto.order  && { order:  dto.order }),
      },
    })
  }

  async remove(id: string) {
    const cat = await this.prisma.category.findUnique({ where: { id }, include: { _count: { select: { products: true } } } })
    if (!cat) throw new NotFoundException('Categoría no encontrada')
    if ((cat as any)._count.products > 0) {
      throw new Error('No se puede eliminar una categoría con productos asignados')
    }
    return this.prisma.category.delete({ where: { id } })
  }
}
