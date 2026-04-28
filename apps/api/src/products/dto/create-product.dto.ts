// apps/api/src/products/dto/create-product.dto.ts
import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, Min } from 'class-validator'
import { Type } from 'class-transformer'

export enum ProductStatusEnum {
  ACTIVE  = 'ACTIVE',
  HIDDEN  = 'HIDDEN',
  DELETED = 'DELETED',
}

export class CreateProductDto {
  @IsString()
  name: string

  @IsOptional()
  @IsString()
  nameEn?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  descriptionEn?: string

  @IsString()
  sku: string

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  weight?: number

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  unitsPerPack: number

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  unitsPerCase: number

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  moq: number

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  basePrice: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stockQuantity?: number

  @IsString()
  categoryId: string

  @IsOptional()
  @IsString()
  subcategoryId?: string

  @IsOptional()
  @IsBoolean()
  isNew?: boolean

  @IsOptional()
  @IsBoolean()
  isTopSeller?: boolean

  @IsOptional()
  @IsString()
  countryOfOrigin?: string

  @IsOptional()
  @IsEnum(ProductStatusEnum)
  status?: ProductStatusEnum
}
