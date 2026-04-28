// apps/api/src/categories/categories.service.ts
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.category.findMany({
      where:   { isActive: true },
      include: { subcategories: { where: { isActive: true }, orderBy: { order: 'asc' } } },
      orderBy: { order: 'asc' },
    })
  }

  findOne(id: string) {
    return this.prisma.category.findUnique({
      where:   { id },
      include: { subcategories: true, products: { where: { status: 'ACTIVE' }, take: 10 } },
    })
  }
}
