// apps/api/src/products/dto/update-product.dto.ts
import { PartialType } from '@nestjs/mapped-types'
import { CreateProductDto } from './create-product.dto'

// Todos los campos de CreateProductDto se vuelven opcionales
export class UpdateProductDto extends PartialType(CreateProductDto) {}

// ─────────────────────────────────────────────────────────────────────────────

// apps/api/src/products/dto/product-filters.dto.ts
import { IsOptional, IsString, IsIn, IsNumberString, IsBoolean } from 'class-validator'
import { Transform } from 'class-transformer'

export class ProductFiltersDto {
  @IsOptional()
  @IsString()
  search?: string

  @IsOptional()
  @IsString()
  categoryId?: string

  @IsOptional()
  @IsString()
  subcategoryId?: string

  @IsOptional()
  @IsIn(['ACTIVE', 'HIDDEN', 'DELETED', 'ALL'])
  status?: string

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isNew?: boolean

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isTopSeller?: boolean

  @IsOptional()
  @IsNumberString()
  page?: number

  @IsOptional()
  @IsNumberString()
  limit?: number
}
