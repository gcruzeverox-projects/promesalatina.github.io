// apps/api/src/quotes/quotes.controller.ts
import {
  Controller, Get, Post, Put, Delete, Param, Body, Query,
  UseGuards, Request, Res
} from '@nestjs/common'
import { Response } from 'express'
import { JwtAuthGuard }  from '../auth/guards/jwt-auth.guard'
import { RolesGuard, Roles } from '../auth/guards/roles.guard'
import { QuotesService }  from './quotes.service'
import { CreateQuoteDto } from './dto/create-quote.dto'
import { UpdateQuoteDto } from './dto/update-quote.dto'

@Controller('quotes')
@UseGuards(JwtAuthGuard)
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'VENTAS')
  findAll(@Query() q: { search?: string; page?: string; limit?: string }) {
    return this.quotesService.findAll({
      search: q.search,
      page:   q.page   ? Number(q.page)  : 1,
      limit:  q.limit  ? Number(q.limit) : 20,
    })
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'VENTAS')
  findOne(@Param('id') id: string) {
    return this.quotesService.findOne(id)
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'VENTAS')
  create(@Body() dto: CreateQuoteDto, @Request() req: any) {
    return this.quotesService.create(dto, req.user.userId)
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'VENTAS')
  update(@Param('id') id: string, @Body() dto: UpdateQuoteDto) {
    return this.quotesService.update(id, dto)
  }

  // Genera PDF + envía por email + actualiza sentAt
  @Post(':id/send')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'VENTAS')
  send(@Param('id') id: string) {
    return this.quotesService.sendQuote(id)
  }

  // Descarga PDF sin enviar
  @Get(':id/pdf')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'VENTAS')
  async downloadPdf(@Param('id') id: string, @Res() res: Response) {
    const buffer = await this.quotesService.getPdfBuffer(id)
    const quote  = await this.quotesService.findOne(id)
    res.set({
      'Content-Type':        'application/pdf',
      'Content-Disposition': `attachment; filename="cotizacion-${quote.quoteNumber}.pdf"`,
      'Content-Length':      buffer.length,
    })
    res.end(buffer)
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.quotesService.remove(id)
  }
}

// ─────────────────────────────────────────────────────────────────────────────

// apps/api/src/quotes/quotes.module.ts
import { Module } from '@nestjs/common'
import { QuotesController } from './quotes.controller'
import { QuotesService }    from './quotes.service'
import { EmailModule }      from '../email/email.module'
import { StorageModule }    from '../storage/storage.module'

@Module({
  imports:     [EmailModule, StorageModule],
  controllers: [QuotesController],
  providers:   [QuotesService],
  exports:     [QuotesService],
})
export class QuotesModule {}
