// apps/api/src/email/email.module.ts
import { Module } from '@nestjs/common'
import { EmailService } from './email.service'

@Module({
  providers: [EmailService],
  exports:   [EmailService],
})
export class EmailModule {}

// ─────────────────────────────────────────────────────────────────────────────

// apps/api/src/email/email.service.ts
import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name)

  async sendOrderConfirmation(to: string, order: any) {
    // REEMPLAZAR AQUÍ INFORMACIÓN DE PROMESA LATINA
    // Implementación completa con Resend en PROMESA_LATINA_TECH_SPEC.md
    this.logger.log(`[Email] Confirmación de orden #${order.orderNumber} → ${to}`)
    // TODO: await resend.emails.send({ from, to, subject, html })
  }

  async sendNewOrderAlert(to: string, order: any) {
    this.logger.log(`[Email] Alerta nueva orden #${order.orderNumber} → ${to}`)
  }

  async sendQuotePDF(to: string, quote: any, pdfBuffer: Buffer) {
    this.logger.log(`[Email] Cotización #${quote.quoteNumber} con PDF → ${to}`)
  }
}
