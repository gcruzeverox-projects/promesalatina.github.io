// apps/api/src/email/email.service.ts
import { Injectable, Logger } from '@nestjs/common'
import { Resend } from 'resend'

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name)
  private resend: Resend

  constructor() {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      this.logger.warn('[Email] RESEND_API_KEY no configurada — emails desactivados')
    }
    this.resend = new Resend(apiKey ?? 're_placeholder')
  }

  // ── Confirmación de orden al cliente ────────────────────────────────────
  async sendOrderConfirmation(to: string, order: any): Promise<void> {
    try {
      await this.resend.emails.send({
        from:    process.env.FROM_EMAIL ?? 'Distribuidora Promesa Latina <onboarding@resend.dev>',
        to,
        subject: `✅ Solicitud #${order.orderNumber?.slice(-8)} recibida — Distribuidora Promesa Latina`,
        html:    this.buildOrderConfirmationHtml(order),
      })
      this.logger.log(`[Email] Confirmación enviada → ${to}`)
    } catch (err) {
      this.logger.error(`[Email] Error confirmación: ${err}`)
    }
  }

  // ── Alerta nueva orden al vendedor ──────────────────────────────────────
  async sendNewOrderAlert(order: any): Promise<void> {
    const salesEmail = process.env.SALES_EMAIL ?? 'gcruzeverox@gmail.com'
    const biz = order.guestBusiness ?? order.user?.businessName ?? order.guestName ?? 'Cliente'
    const itemsHtml = (order.items ?? []).map((item: any) => `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px;">${item.product?.name ?? item.name ?? '—'}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #f1f5f9; text-align: center; font-size: 13px;">${item.quantity} caja(s)</td>
      </tr>
    `).join('')

    try {
      await this.resend.emails.send({
        from:    process.env.FROM_EMAIL ?? 'Distribuidora Promesa Latina <onboarding@resend.dev>',
        to:      salesEmail,
        subject: `🆕 Nueva solicitud — ${biz} | ${order.items?.length ?? 0} productos`,
        html: `
          <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
            <div style="background: #1F3A93; padding: 20px 24px; border-radius: 12px; margin-bottom: 24px;">
              <h1 style="color: #fff; margin: 0; font-family: Poppins, sans-serif; font-size: 18px;">🆕 Nueva solicitud recibida</h1>
              <p style="color: rgba(255,255,255,0.7); margin: 4px 0 0; font-size: 13px;">Distribuidora Promesa Latina</p>
            </div>

            <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin-bottom: 20px;">
              <tr><td style="padding: 6px 0; color: #64748b; width: 160px;">Cliente / Negocio:</td><td><strong>${biz}</strong></td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">Email:</td><td>${order.guestEmail ?? order.user?.email ?? '—'}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">Teléfono:</td><td>${order.guestPhone ?? order.user?.phone ?? '—'}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">N.° Solicitud:</td><td><code>#${order.orderNumber}</code></td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">Productos:</td><td><strong>${order.items?.length ?? 0} SKUs</strong></td></tr>
            </table>

            <h3 style="color: #1F3A93; font-size: 14px; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 0.05em;">Productos solicitados</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 24px;">
              <thead>
                <tr style="background: #f8fafc;">
                  <th style="padding: 8px 12px; text-align: left; color: #475569; font-size: 11px; text-transform: uppercase;">Producto</th>
                  <th style="padding: 8px 12px; text-align: center; color: #475569; font-size: 11px; text-transform: uppercase;">Cantidad</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>

            <a href="${process.env.ADMIN_URL ?? 'https://promesalatina-github-io.vercel.app'}/admin/quotes?orderId=${order.id}"
               style="display: inline-block; background: #E65100; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px;">
              + Crear cotización →
            </a>

            <p style="color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px;">
              Distribuidora Promesa Latina · ventas@promesalatina.com
            </p>
          </div>
        `,
      })
      this.logger.log(`[Email] Alerta vendedor → ${salesEmail}`)
    } catch (err) {
      this.logger.error(`[Email] Error alerta vendedor: ${err}`)
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
      from:    process.env.FROM_EMAIL ?? 'Distribuidora Promesa Latina <onboarding@resend.dev>',
      to,
      subject: `📄 Cotización #${quote.quoteNumber?.slice(-8)} — Válida hasta ${validDate}`,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 560px; padding: 24px;">
          <div style="background: #1F3A93; padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
            <img src="https://res.cloudinary.com/db9s1q9zf/image/upload/v1778209449/LOGO_SIN_FONDO_hn3n6b.png" alt="Distribuidora Promesa Latina" style="height: 80px; width: auto; object-fit: contain;" />
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

          <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              Distribuidora Promesa Latina · <a href="mailto:ventas@promesalatina.com" style="color: #1F3A93;">ventas@promesalatina.com</a>
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

  // ── Template HTML confirmación al cliente ───────────────────────────────
  private buildOrderConfirmationHtml(order: any): string {
    const client = order.guestBusiness ?? order.user?.businessName ?? order.guestName ?? 'Cliente'
    const items = (order.items ?? []).map((item: any) => `
      <tr>
        <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; font-size: 13px;">${item.product?.name ?? item.name ?? '—'}</td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; text-align: center; font-size: 13px;">${item.quantity} caja(s)</td>
      </tr>
    `).join('')

    return `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #fff;">
        <div style="background: #1F3A93; padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
          <img src="https://res.cloudinary.com/db9s1q9zf/image/upload/v1778209449/LOGO_SIN_FONDO_hn3n6b.png" alt="Distribuidora Promesa Latina" style="height: 72px; width: auto; object-fit: contain;" />
          <p style="color: rgba(255,255,255,0.7); font-size: 13px; margin: 8px 0 0;">Distribuidora B2B · Productos Latinoamericanos</p>
        </div>

        <h2 style="color: #1F3A93; margin: 0 0 8px;">Hola, ${client} 👋</h2>
        <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
          Hemos recibido tu solicitud de cotización. Nuestro equipo revisará la disponibilidad y precios de los productos
          y te enviará una cotización formal en las próximas 24 horas.
        </p>

        <h3 style="color: #1F3A93; font-size: 13px; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 0.05em;">
          Productos solicitados
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 24px;">
          <thead>
            <tr style="background: #f8fafc;">
              <th style="padding: 10px 14px; text-align: left; color: #475569; font-size: 11px; letter-spacing: .05em; text-transform: uppercase;">Producto</th>
              <th style="padding: 10px 14px; text-align: center; color: #475569; font-size: 11px; text-transform: uppercase;">Cantidad</th>
            </tr>
          </thead>
          <tbody>${items}</tbody>
        </table>

        <div style="background: #f0f4ff; border-radius: 10px; padding: 14px 18px; margin-bottom: 20px;">
          <p style="color: #4338CA; font-size: 13px; margin: 0;">
            📋 N.° Solicitud: <strong>#${order.orderNumber?.slice(-8)}</strong>
          </p>
        </div>

        <p style="color: #64748b; font-size: 13px; line-height: 1.7; margin: 0 0 20px;">
          Si tienes alguna pregunta, responde a este correo y con gusto te atendemos.
        </p>

        <p style="color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 16px; margin: 0;">
          Distribuidora Promesa Latina · <a href="mailto:ventas@promesalatina.com" style="color: #1F3A93;">ventas@promesalatina.com</a> · Los Ángeles, CA
        </p>
      </body>
      </html>
    `
  }
}
