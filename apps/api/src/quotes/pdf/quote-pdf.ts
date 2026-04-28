// apps/api/src/quotes/pdf/quote-pdf.ts
// Plantilla PDF profesional usando React.createElement puro (sin JSX)
// NestJS tsconfig no tiene --jsx, por eso se usa .ts en lugar de .tsx

import React from 'react'
import {
  Document, Page, Text, View, StyleSheet,
} from '@react-pdf/renderer'

const fmt = (n: number) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const S = StyleSheet.create({
  page:        { padding: '36 40', fontFamily: 'Helvetica', fontSize: 9, color: '#1e293b' },
  header:      { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 16, borderBottom: '1.5 solid #1F3A93' },
  logoBox:     { flexDirection: 'column' },
  compName:    { fontSize: 20, fontFamily: 'Helvetica-Bold', color: '#1F3A93', marginBottom: 2 },
  compSub:     { fontSize: 8, color: '#94a3b8', marginBottom: 6 },
  compMeta:    { fontSize: 8, color: '#64748b' },
  quoteBox:    { alignItems: 'flex-end' },
  quoteLabel:  { fontSize: 22, fontFamily: 'Helvetica-Bold', color: '#E65100' },
  quoteNum:    { fontSize: 10, color: '#475569', marginTop: 2 },
  quoteDate:   { fontSize: 8, color: '#94a3b8', marginTop: 3 },
  validBadge:  { backgroundColor: '#E65100', color: '#ffffff', padding: '3 8', borderRadius: 4, fontSize: 8, fontFamily: 'Helvetica-Bold', alignSelf: 'flex-start', marginBottom: 14 },
  twoCol:      { flexDirection: 'row', gap: 16, marginBottom: 16 },
  clientBox:   { flex: 1, backgroundColor: '#f0f4ff', borderRadius: 6, padding: '12 14' },
  summaryBox:  { width: 180, backgroundColor: '#f8fafc', borderRadius: 6, padding: '12 14' },
  sectionLabel:{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#1F3A93', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 },
  row2:        { flexDirection: 'row', marginBottom: 4 },
  metaKey:     { color: '#64748b', width: 70 },
  metaVal:     { fontFamily: 'Helvetica-Bold', flex: 1 },
  table:       { marginBottom: 16 },
  tHead:       { flexDirection: 'row', backgroundColor: '#1F3A93', borderRadius: '4 4 0 0', padding: '6 10' },
  tHeadCell:   { color: '#ffffff', fontFamily: 'Helvetica-Bold', fontSize: 8 },
  tRow:        { flexDirection: 'row', padding: '8 10', borderBottom: '0.5 solid #f1f5f9' },
  tRowAlt:     { backgroundColor: '#f8fafc' },
  tCell:       { fontSize: 8, color: '#1e293b' },
  colProd:     { width: '28%' },
  colSku:      { width: '12%', color: '#94a3b8' },
  colQty:      { width: '10%', textAlign: 'center' },
  colAvail:    { width: '10%', textAlign: 'center' },
  colPrice:    { width: '13%', textAlign: 'right' },
  colDays:     { width: '10%', textAlign: 'center' },
  colSub:      { width: '17%', textAlign: 'right' },
  totalsSection:{ alignItems: 'flex-end', marginBottom: 16 },
  totalRow:    { flexDirection: 'row', marginBottom: 3 },
  totalKey:    { color: '#64748b', fontSize: 9, width: 120, textAlign: 'right', marginRight: 12 },
  totalVal:    { fontSize: 9, fontFamily: 'Helvetica-Bold', width: 80, textAlign: 'right' },
  grandTotal:  { flexDirection: 'row', backgroundColor: '#1F3A93', borderRadius: 6, padding: '10 14', marginTop: 6 },
  gtKey:       { color: 'rgba(255,255,255,0.85)', fontFamily: 'Helvetica-Bold', fontSize: 12, flex: 1 },
  gtVal:       { color: '#fbbf24', fontFamily: 'Helvetica-Bold', fontSize: 16 },
  notesBox:    { backgroundColor: '#fffbeb', borderRadius: 6, padding: '10 12', marginBottom: 14, border: '0.5 solid #fcd34d' },
  notesLabel:  { fontFamily: 'Helvetica-Bold', color: '#92400e', fontSize: 8, marginBottom: 4 },
  notesText:   { color: '#78350f', fontSize: 8 },
  terms:       { backgroundColor: '#f8fafc', borderRadius: 6, padding: '10 12', marginBottom: 14 },
  termsLabel:  { fontFamily: 'Helvetica-Bold', color: '#475569', fontSize: 8, marginBottom: 4 },
  termsText:   { color: '#64748b', fontSize: 7.5, lineHeight: 1.5 },
  footer:      { position: 'absolute', bottom: 28, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', borderTop: '0.5 solid #e2e8f0', paddingTop: 8 },
  footerText:  { fontSize: 7.5, color: '#94a3b8' },
})

// Alias corto para no repetir React.createElement
const ce = React.createElement

export function QuotePdfTemplate({ quote }: { quote: any }) {
  const client = quote.order?.user ?? {
    name:         quote.order?.guestName,
    email:        quote.order?.guestEmail,
    phone:        quote.order?.guestPhone,
    businessName: quote.order?.guestBusiness,
    address:      quote.order?.guestAddress,
  }
  const biz       = client.businessName ?? client.name ?? 'Cliente'
  const validDate = new Date(quote.validUntil).toLocaleDateString('es-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const createdDate = new Date(quote.createdAt).toLocaleDateString('es-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return ce(Document, { title: `Cotización ${quote.quoteNumber} — Promesa Latina` },
    ce(Page, { size: 'A4', style: S.page },

      // HEADER
      ce(View, { style: S.header },
        ce(View, { style: S.logoBox },
          // REEMPLAZAR LOGO DE PROMESA LATINA AQUÍ
          ce(Text, { style: S.compName }, 'Promesa Latina'),
          ce(Text, { style: S.compSub }, 'Distribuidora B2B · Productos Latinoamericanos'),
          // REEMPLAZAR AQUÍ INFORMACIÓN DE PROMESA LATINA
          ce(Text, { style: S.compMeta }, 'ventas@promesalatina.com  ·  +1 (XXX) XXX-XXXX'),
          ce(Text, { style: S.compMeta }, 'Los Ángeles, California — EE.UU.'),
        ),
        ce(View, { style: S.quoteBox },
          ce(Text, { style: S.quoteLabel }, 'COTIZACIÓN'),
          ce(Text, { style: S.quoteNum }, `#${quote.quoteNumber}`),
          ce(Text, { style: S.quoteDate }, `Fecha: ${createdDate}`),
          ce(Text, { style: S.quoteDate }, `Ref. Orden: #${quote.order?.orderNumber}`),
        ),
      ),

      // VIGENCIA
      ce(Text, { style: S.validBadge }, `Válida hasta: ${validDate}`),

      // CLIENTE + RESUMEN
      ce(View, { style: S.twoCol },
        ce(View, { style: S.clientBox },
          ce(Text, { style: S.sectionLabel }, 'Datos del cliente'),
          ...[
            ['Negocio',   biz],
            ['Contacto',  client.name ?? ''],
            ['Email',     client.email ?? ''],
            ['Teléfono',  client.phone ?? ''],
            ['Dirección', client.address ?? ''],
          ].filter(([, v]) => v).map(([k, v]) =>
            ce(View, { key: k as string, style: S.row2 },
              ce(Text, { style: S.metaKey }, `${k}:`),
              ce(Text, { style: S.metaVal }, v as string),
            )
          ),
        ),
        ce(View, { style: S.summaryBox },
          ce(Text, { style: S.sectionLabel }, 'Resumen'),
          ...[
            ['Items',        `${quote.items?.length ?? 0} productos`],
            ['% Ganancia',   `${quote.profitPercent}%`],
            ['% Embotellado',`${quote.bottlingPercent}%`],
          ].map(([k, v]) =>
            ce(View, { key: k as string, style: S.row2 },
              ce(Text, { style: S.metaKey }, `${k}:`),
              ce(Text, { style: S.metaVal }, v as string),
            )
          ),
        ),
      ),

      // TABLA
      ce(View, { style: S.table },
        ce(View, { style: S.tHead },
          ce(Text, { style: [S.tHeadCell, S.colProd] }, 'Producto'),
          ce(Text, { style: [S.tHeadCell, S.colSku] },  'SKU'),
          ce(Text, { style: [S.tHeadCell, S.colQty] },  'Cant.'),
          ce(Text, { style: [S.tHeadCell, S.colAvail] },'Dispon.'),
          ce(Text, { style: [S.tHeadCell, S.colPrice] },'P. Unit.'),
          ce(Text, { style: [S.tHeadCell, S.colDays] }, 'Días'),
          ce(Text, { style: [S.tHeadCell, S.colSub] },  'Subtotal'),
        ),
        ...(quote.items ?? []).map((item: any, i: number) =>
          ce(View, { key: item.id ?? i, style: [S.tRow, i % 2 === 1 ? S.tRowAlt : {}] },
            ce(View, { style: S.colProd },
              ce(Text, { style: [S.tCell, { fontFamily: 'Helvetica-Bold' }] }, item.product?.name ?? ''),
              item.notes ? ce(Text, { style: [S.tCell, { color: '#64748b', fontSize: 7, marginTop: 1 }] }, item.notes) : null,
            ),
            ce(Text, { style: [S.tCell, S.colSku] },  item.product?.sku ?? ''),
            ce(Text, { style: [S.tCell, S.colQty] },  `${item.quantity} ${item.unitType}`),
            ce(Text, { style: [S.tCell, S.colAvail, { color: item.isAvailable ? '#16a34a' : '#dc2626' }] }, item.isAvailable ? 'Sí' : 'No'),
            ce(Text, { style: [S.tCell, S.colPrice] }, fmt(item.salePrice)),
            ce(Text, { style: [S.tCell, S.colDays] },  item.deliveryDays ? `${item.deliveryDays}d` : '—'),
            ce(Text, { style: [S.tCell, S.colSub, { fontFamily: 'Helvetica-Bold' }] }, fmt(item.subtotal)),
          )
        ),
      ),

      // TOTALES
      ce(View, { style: S.totalsSection },
        ce(View, { style: S.totalRow },
          ce(Text, { style: S.totalKey }, 'Subtotal:'),
          ce(Text, { style: S.totalVal }, fmt(quote.subtotal)),
        ),
        quote.fees > 0 ? ce(View, { style: S.totalRow },
          ce(Text, { style: S.totalKey }, 'Fees / Cargos:'),
          ce(Text, { style: S.totalVal }, fmt(quote.fees)),
        ) : null,
        ce(View, { style: [S.grandTotal, { width: 220 }] },
          ce(Text, { style: S.gtKey }, 'TOTAL USD:'),
          ce(Text, { style: S.gtVal }, fmt(quote.total)),
        ),
      ),

      // NOTAS
      quote.notes ? ce(View, { style: S.notesBox },
        ce(Text, { style: S.notesLabel }, 'Notas comerciales'),
        ce(Text, { style: S.notesText }, quote.notes),
      ) : null,

      // TÉRMINOS
      ce(View, { style: S.terms },
        ce(Text, { style: S.termsLabel }, 'Términos y condiciones'),
        ce(Text, { style: S.termsText },
          '1. Esta cotización tiene validez hasta la fecha indicada.\n' +
          '2. Los precios están en USD y no incluyen impuestos locales.\n' +
          '3. La disponibilidad está sujeta a confirmación de inventario.\n' +
          // REEMPLAZAR AQUÍ INFORMACIÓN DE PROMESA LATINA
          '4. Consultas: ventas@promesalatina.com'
        ),
      ),

      // FOOTER
      ce(View, { style: S.footer, fixed: true } as any,
        // REEMPLAZAR AQUÍ INFORMACIÓN DE PROMESA LATINA
        ce(Text, { style: S.footerText }, 'Promesa Latina  ·  ventas@promesalatina.com  ·  +1 (XXX) XXX-XXXX'),
        ce(Text, { style: S.footerText }, `Cotización válida hasta ${validDate}`),
      ),
    )
  )
}
