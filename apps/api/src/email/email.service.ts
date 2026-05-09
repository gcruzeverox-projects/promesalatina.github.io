// apps/api/src/email/email.service.ts
// Servicio de correos con Resend.
// Cubre: confirmación de orden, alerta al equipo de ventas, envío de cotización PDF.

import { Injectable, Logger } from '@nestjs/common'
import { Resend } from 'resend'

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name)
  private resend: Resend

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY)
  }

  // ── Confirmación de orden al cliente ────────────────────────────────────
  async sendOrderConfirmation(to: string, order: any): Promise<void> {
    try {
      await this.resend.emails.send({
        // REEMPLAZAR AQUÍ INFORMACIÓN DE PROMESA LATINA
        from:    process.env.FROM_EMAIL ?? 'Promesa Latina <onboarding@resend.dev>',
        to,
        subject: `✅ Orden #${order.orderNumber?.slice(-8)} recibida — Promesa Latina`,
        html:    this.buildOrderConfirmationHtml(order),
      })
      this.logger.log(`[Email] Confirmación enviada → ${to}`)
    } catch (err) {
      this.logger.error(`[Email] Error confirmación: ${err}`)
      // No lanzar — el error de email no debe fallar la creación de la orden
    }
  }

  // ── Alerta nueva orden al equipo de ventas ──────────────────────────────
  async sendNewOrderAlert(order: any): Promise<void> {
    const salesEmail = process.env.SALES_EMAIL ?? 'ventas@promesalatina.com'
    const biz = order.guestBusiness ?? order.user?.businessName ?? order.guestName ?? 'Cliente'
    try {
      await this.resend.emails.send({
        from:    process.env.FROM_EMAIL ?? 'Sistema Promesa Latina <sistema@promesalatina.com>',
        to:      salesEmail,
        subject: `🆕 Nueva orden — ${biz} | $${order.total?.toFixed(2)}`,
        html: `
          <div style="font-family: Inter, sans-serif; max-width: 560px; padding: 24px;">
            <h2 style="color: #1F3A93; margin: 0 0 16px;">Nueva orden recibida</h2>
            <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
              <tr><td style="padding: 6px 0; color: #64748b; width: 140px;">Negocio:</td><td><strong>${biz}</strong></td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">Email:</td><td>${order.guestEmail ?? order.user?.email ?? '—'}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">Teléfono:</td><td>${order.guestPhone ?? order.user?.phone ?? '—'}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">N.° Orden:</td><td><code>#${order.orderNumber}</code></td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">Productos:</td><td>${order.items?.length ?? 0} SKUs</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">Total estimado:</td><td><strong style="color: #1F3A93; font-size: 16px;">$${order.total?.toFixed(2)}</strong></td></tr>
            </table>
            <a href="${process.env.ADMIN_URL ?? 'http://localhost:3000'}/admin/quotes?orderId=${order.id}"
               style="display: inline-block; margin-top: 20px; background: #E65100; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 13px;">
              + Crear cotización →
            </a>
          </div>
        `,
      })
      this.logger.log(`[Email] Alerta equipo ventas → ${salesEmail}`)
    } catch (err) {
      this.logger.error(`[Email] Error alerta ventas: ${err}`)
    }
  }

  // ── Cotización PDF al cliente ────────────────────────────────────────────
  async sendQuotePDF(to: string, quote: any, pdfBuffer: Buffer): Promise<void> {
    const client   = quote.order?.user?.businessName ?? quote.order?.guestBusiness
                   ?? quote.order?.user?.name ?? quote.order?.guestName ?? 'Cliente'
    const validDate = new Date(quote.validUntil).toLocaleDateString('es-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    })

    await this.resend.emails.send({
      from:    process.env.FROM_EMAIL ?? 'Promesa Latina <ventas@promesalatina.com>',
      to,
      subject: `📄 Cotización #${quote.quoteNumber?.slice(-8)} — Válida hasta ${validDate}`,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 560px; padding: 24px;">
          <div style="background: #1F3A93; padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
            <img src="https://res.cloudinary.com/db9s1q9zf/image/upload/v1778209449/LOGO_SIN_FONDO_hn3n6b.png" alt="Promesa Latina" style="height: 80px; width: auto; object-fit: contain;" />
            <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0; font-size: 13px;">Distribuidora B2B · Productos Latinoamericanos</p>
          </div>

          <h2 style="color: #1F3A93; margin: 0 0 4px;">Hola, ${client}</h2>
          <p style="color: #64748b; font-size: 14px; margin: 0 0 20px;">
            Adjuntamos la cotización personalizada que solicitó. Por favor revísela y contáctenos para confirmar su pedido.
          </p>

          <div style="background: #f0f4ff; border-radius: 10px; padding: 16px 20px; margin-bottom: 20px; border: 1px solid #c7d2fe;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #64748b; font-size: 13px;">Número de cotización:</span>
              <strong style="font-size: 13px; color: #1F3A93;">#${quote.quoteNumber}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #64748b; font-size: 13px;">Total:</span>
              <strong style="font-size: 18px; color: #1F3A93; font-family: Poppins, sans-serif;">$${quote.total?.toFixed(2)} USD</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #64748b; font-size: 13px;">Válida hasta:</span>
              <strong style="font-size: 13px; color: #E65100;">${validDate}</strong>
            </div>
          </div>

          <p style="color: #64748b; font-size: 13px; line-height: 1.7;">
            El PDF con el detalle completo de productos, precios y términos está adjunto a este correo.
          </p>

          <!-- REEMPLAZAR AQUÍ INFORMACIÓN DE CONTACTO DE PROMESA LATINA -->
          <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              Promesa Latina · <a href="mailto:ventas@promesalatina.com" style="color: #1F3A93;">ventas@promesalatina.com</a> · +1 (XXX) XXX-XXXX
            </p>
          </div>
        </div>
      `,
      attachments: [{
        filename: `cotizacion-${quote.quoteNumber}.pdf`,
        content:  pdfBuffer.toString('base64'),
      }],
    })
    this.logger.log(`[Email] Cotización PDF enviada → ${to}`)
  }

  // ── Template HTML de confirmación de orden ──────────────────────────────
  private buildOrderConfirmationHtml(order: any): string {
    const items = (order.items ?? []).map((item: any) => `
      <tr>
        <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9;">${item.product?.name ?? '—'}</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; text-align: center;">${item.quantity} ${item.unitType}</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; text-align: right;">$${item.subtotal?.toFixed(2)}</td>
      </tr>
    `).join('')

    return `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #fff;">
        <div style="background: #1F3A93; padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <!-- REEMPLAZAR LOGO DE PROMESA LATINA AQUÍ -->
          <h1 style="color: #fff; margin: 0; font-family: Poppins, sans-serif;">Promesa Latina</h1>
          <p style="color: rgba(255,255,255,.7); font-size: 13px; margin: 4px 0 0;">Confirmación de orden</p>
        </div>

        <h2 style="color: #1F3A93; margin: 0 0 16px;">Orden #${order.orderNumber?.slice(-8)} recibida</h2>
        <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
          Hemos recibido su pedido. Nuestro equipo lo revisará y le enviará una cotización formal en las próximas 24 horas.
        </p>

        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
          <thead>
            <tr style="background: #f8fafc;">
              <th style="padding: 10px 14px; text-align: left; color: #475569; font-size: 11px; letter-spacing: .05em; text-transform: uppercase;">Producto</th>
              <th style="padding: 10px 14px; text-align: center; color: #475569; font-size: 11px; text-transform: uppercase;">Cantidad</th>
              <th style="padding: 10px 14px; text-align: right; color: #475569; font-size: 11px; text-transform: uppercase;">Subtotal</th>
            </tr>
          </thead>
          <tbody>${items}</tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 12px 14px; text-align: right; font-weight: 700; color: #475569;">Total estimado:</td>
              <td style="padding: 12px 14px; text-align: right; font-weight: 800; color: #1F3A93; font-size: 16px;">$${order.total?.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        <!-- REEMPLAZAR AQUÍ INFORMACIÓN DE CONTACTO DE PROMESA LATINA -->
        <p style="color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 16px; margin: 0;">
          Promesa Latina · ventas@promesalatina.com · +1 (XXX) XXX-XXXX · Los Ángeles, CA
        </p>
      </body>
      </html>
    `
  }
}
