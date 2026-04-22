// apps/api/src/categories/categories.module.ts
import { Module } from '@nestjs/common'
import { CategoriesController } from './categories.controller'
import { CategoriesService } from './categories.service'

@Module({
  controllers: [CategoriesController],
  providers:   [CategoriesService],
  exports:     [CategoriesService],
})
export class CategoriesModule {}

// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────

// apps/api/src/categories/categories.controller.ts
import { Controller, Get, Param } from '@nestjs/common'
import { CategoriesService } from './categories.service'

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll() { return this.categoriesService.findAll() }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.categoriesService.findOne(id) }
}
