// apps/api/src/products/products.controller.ts
// Controlador REST para el módulo de productos
// Rutas protegidas por JWT + RBAC según el rol requerido

import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, Query, UseGuards, UseInterceptors,
  UploadedFiles, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator,
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard, Roles } from '../auth/guards/roles.guard'
import { ProductsService } from './products.service'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { ProductFiltersDto } from './dto/product-filters.dto'

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ── Público: catálogo ──────────────────────────────────────────────────────
  @Get()
  findAll(@Query() filters: ProductFiltersDto) {
    return this.productsService.findAll(filters)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id)
  }

  // ── Admin / Ventas ─────────────────────────────────────────────────────────
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto)
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto)
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.productsService.updateStatus(id, status as any)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id)
  }

  @Post(':id/duplicate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  duplicate(@Param('id') id: string) {
    return this.productsService.duplicate(id)
  }

  // ── Imágenes ───────────────────────────────────────────────────────────────
  @Post(':id/images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FilesInterceptor('images', 8))
  uploadImages(
    @Param('id') id: string,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /image\/(jpeg|png|webp|avif)/ }),
        ],
      })
    )
    files: Express.Multer.File[],
  ) {
    return this.productsService.uploadImages(id, files)
  }

  @Delete(':id/images/:imageId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  deleteImage(@Param('id') id: string, @Param('imageId') imageId: string) {
    return this.productsService.deleteImage(id, imageId)
  }

  @Patch(':id/images/reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  reorderImages(@Param('id') id: string, @Body('imageIds') imageIds: string[]) {
    return this.productsService.reorderImages(id, imageIds)
  }
}
