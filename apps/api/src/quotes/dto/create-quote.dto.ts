// apps/api/src/quotes/dto/create-quote.dto.ts
import {
  IsString, IsOptional, IsNumber, IsBoolean,
  IsArray, ValidateNested, Min, Max
} from 'class-validator'
import { Type } from 'class-transformer'

export class QuoteItemDto {
  @IsString()
  productId: string

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity: number

  @IsString()
  unitType: string

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  supplierPrice: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  bottlingCost?: number

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  salePrice: number

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean

  @IsOptional()
  deliveryDays?: string | number

  @IsOptional()
  @IsString()
  notes?: string
}

export class CreateQuoteDto {
  @IsString()
  orderId: string

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(365)
  validDays?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  profitPercent?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  bottlingPercent?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  fees?: number

  @IsOptional()
  @IsString()
  notes?: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuoteItemDto)
  items: QuoteItemDto[]
}
