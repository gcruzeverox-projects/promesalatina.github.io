// apps/api/src/products/dto/product-filters.dto.ts
import { IsOptional, IsString, IsIn } from 'class-validator'
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
  @Transform(({ value }) => value === 'true' || value === true)
  isNew?: boolean

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isTopSeller?: boolean

  @IsOptional()
  @Transform(({ value }) => Number(value))
  page?: number

  @IsOptional()
  @Transform(({ value }) => Number(value))
  limit?: number
}
