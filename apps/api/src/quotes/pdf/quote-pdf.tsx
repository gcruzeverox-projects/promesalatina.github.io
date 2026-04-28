// apps/api/src/quotes/pdf/quote-pdf.tsx
// Plantilla PDF profesional para cotizaciones de Promesa Latina.
// Usa @react-pdf/renderer — diseño tipo factura comercial B2B.

import React from 'react'
import {
  Document, Page, Text, View, StyleSheet, Image
} from '@react-pdf/renderer'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

// ─── Estilos ──────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  page:       { padding: '36 40', fontFamily: 'Helvetica', fontSize: 9, color: '#1e293b', backgroundColor: '#ffffff' },

  // Header
  header:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 16, borderBottom: '1.5 solid #1F3A93' },
  logoBox:    { flexDirection: 'column' },
  compName:   { fontSize: 20, fontFamily: 'Helvetica-Bold', color: '#1F3A93', marginBottom: 2 },
  compSub:    { fontSize: 8, color: '#94a3b8', marginBottom: 6 },
  compMeta:   { fontSize: 8, color: '#64748b' },
  quoteBox:   { alignItems: 'flex-end' },
  quoteLabel: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: '#E65100' },
  quoteNum:   { fontSize: 10, color: '#475569', marginTop: 2 },
  quoteDate:  { fontSize: 8, color: '#94a3b8', marginTop: 3 },

  // Badges / pills
  validBadge: { backgroundColor: '#E65100', color: '#ffffff', padding: '3 8', borderRadius: 4, fontSize: 8, fontFamily: 'Helvetica-Bold', alignSelf: 'flex-start', marginBottom: 14 },

  // Dos columnas: cliente + resumen
  twoCol:      { flexDirection: 'row', gap: 16, marginBottom: 16 },
  clientBox:   { flex: 1, backgroundColor: '#f0f4ff', borderRadius: 6, padding: '12 14' },
  summaryBox:  { width: 180, backgroundColor: '#f8fafc', borderRadius: 6, padding: '12 14' },
  sectionLabel:{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#1F3A93', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 },
  row2:        { flexDirection: 'row', marginBottom: 4 },
  metaKey:     { color: '#64748b', width: 70 },
  metaVal:     { fontFamily: 'Helvetica-Bold', flex: 1 },

  // Tabla de productos
  table:       { marginBottom: 16 },
  tHead:       { flexDirection: 'row', backgroundColor: '#1F3A93', borderRadius: '4 4 0 0', padding: '6 10' },
  tHeadCell:   { color: '#ffffff', fontFamily: 'Helvetica-Bold', fontSize: 8 },
  tRow:        { flexDirection: 'row', padding: '8 10', borderBottom: '0.5 solid #f1f5f9' },
  tRowAlt:     { backgroundColor: '#f8fafc' },
  tCell:       { fontSize: 8, color: '#1e293b' },

  // Columnas de la tabla (anchos proporcionales)
  colProd:     { width: '28%' },
  colSku:      { width: '12%', color: '#94a3b8' },
  colQty:      { width: '10%', textAlign: 'center' },
  colAvail:    { width: '10%', textAlign: 'center' },
  colPrice:    { width: '13%', textAlign: 'right' },
  colDays:     { width: '10%', textAlign: 'center' },
  colSub:      { width: '17%', textAlign: 'right' },

  // Totales
  totalsSection: { alignItems: 'flex-end', marginBottom: 16 },
  totalRow:    { flexDirection: 'row', marginBottom: 3 },
  totalKey:    { color: '#64748b', fontSize: 9, width: 120, textAlign: 'right', marginRight: 12 },
  totalVal:    { fontSize: 9, fontFamily: 'Helvetica-Bold', width: 80, textAlign: 'right' },
  grandTotal:  { flexDirection: 'row', backgroundColor: '#1F3A93', borderRadius: 6, padding: '10 14', marginTop: 6 },
  gtKey:       { color: 'rgba(255,255,255,0.85)', fontFamily: 'Helvetica-Bold', fontSize: 12, flex: 1 },
  gtVal:       { color: '#fbbf24', fontFamily: 'Helvetica-Bold', fontSize: 16 },

  // Notas
  notesBox:    { backgroundColor: '#fffbeb', borderRadius: 6, padding: '10 12', marginBottom: 14, border: '0.5 solid #fcd34d' },
  notesLabel:  { fontFamily: 'Helvetica-Bold', color: '#92400e', fontSize: 8, marginBottom: 4 },
  notesText:   { color: '#78350f', fontSize: 8 },

  // Términos
  terms:       { backgroundColor: '#f8fafc', borderRadius: 6, padding: '10 12', marginBottom: 14 },
  termsLabel:  { fontFamily: 'Helvetica-Bold', color: '#475569', fontSize: 8, marginBottom: 4 },
  termsText:   { color: '#64748b', fontSize: 7.5, lineHeight: 1.5 },

  // Footer
  footer:      { position: 'absolute', bottom: 28, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', borderTop: '0.5 solid #e2e8f0', paddingTop: 8 },
  footerText:  { fontSize: 7.5, color: '#94a3b8' },
})

// ─── Plantilla principal ───────────────────────────────────────────────────────
export function QuotePdfTemplate({ quote }: { quote: any }) {
  const client = quote.order.user ?? {
    name:         quote.order.guestName,
    email:        quote.order.guestEmail,
    phone:        quote.order.guestPhone,
    businessName: quote.order.guestBusiness,
    address:      quote.order.guestAddress,
  }
  const biz      = client.businessName ?? client.name ?? 'Cliente'
  const validDate = new Date(quote.validUntil).toLocaleDateString('es-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const createdDate = new Date(quote.createdAt).toLocaleDateString('es-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <Document title={`Cotización ${quote.quoteNumber} — Promesa Latina`} author="Promesa Latina">
      <Page size="A4" style={S.page}>

        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <View style={S.header}>
          <View style={S.logoBox}>
            {/* REEMPLAZAR LOGO DE PROMESA LATINA AQUÍ */}
            {/* <Image src={logoPath} style={{ width: 130, height: 44, marginBottom: 6 }} /> */}
            <Text style={S.compName}>Promesa Latina</Text>
            <Text style={S.compSub}>Distribuidora B2B · Productos Latinoamericanos</Text>
            {/* REEMPLAZAR AQUÍ INFORMACIÓN DE PROMESA LATINA */}
            <Text style={S.compMeta}>ventas@promesalatina.com  ·  +1 (XXX) XXX-XXXX</Text>
            <Text style={S.compMeta}>Los Ángeles, California — EE.UU.</Text>
          </View>
          <View style={S.quoteBox}>
            <Text style={S.quoteLabel}>COTIZACIÓN</Text>
            <Text style={S.quoteNum}>#{quote.quoteNumber}</Text>
            <Text style={S.quoteDate}>Fecha: {createdDate}</Text>
            <Text style={S.quoteDate}>Ref. Orden: #{quote.order.orderNumber}</Text>
          </View>
        </View>

        {/* Vigencia badge */}
        <Text style={S.validBadge}>Válida hasta: {validDate}</Text>

        {/* ── DOS COLUMNAS: CLIENTE + RESUMEN RÁPIDO ──────────────────────── */}
        <View style={S.twoCol}>
          <View style={S.clientBox}>
            <Text style={S.sectionLabel}>Datos del cliente</Text>
            {[
              ['Negocio',  biz],
              ['Contacto', client.name ?? ''],
              ['Email',    client.email ?? ''],
              ['Teléfono', client.phone ?? ''],
              ['Dirección',client.address ?? ''],
            ].filter(([, v]) => v).map(([k, v]) => (
              <View key={k} style={S.row2}>
                <Text style={S.metaKey}>{k}:</Text>
                <Text style={S.metaVal}>{v}</Text>
              </View>
            ))}
          </View>
          <View style={S.summaryBox}>
            <Text style={S.sectionLabel}>Resumen</Text>
            {[
              ['Items',       `${quote.items.length} productos`],
              ['% Ganancia',  `${quote.profitPercent}%`],
              ['% Embotellado',`${quote.bottlingPercent}%`],
              ['Vigencia',    `${Math.round((new Date(quote.validUntil).getTime() - Date.now()) / 86400000)} días`],
            ].map(([k, v]) => (
              <View key={k} style={S.row2}>
                <Text style={S.metaKey}>{k}:</Text>
                <Text style={S.metaVal}>{v}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── TABLA DE PRODUCTOS ───────────────────────────────────────────── */}
        <View style={S.table}>
          {/* Encabezado */}
          <View style={S.tHead}>
            <Text style={[S.tHeadCell, S.colProd]}>Producto</Text>
            <Text style={[S.tHeadCell, S.colSku]}>SKU</Text>
            <Text style={[S.tHeadCell, S.colQty]}>Cant.</Text>
            <Text style={[S.tHeadCell, S.colAvail]}>Dispon.</Text>
            <Text style={[S.tHeadCell, S.colPrice]}>P. Unit.</Text>
            <Text style={[S.tHeadCell, S.colDays]}>Días</Text>
            <Text style={[S.tHeadCell, S.colSub]}>Subtotal</Text>
          </View>

          {quote.items.map((item: any, i: number) => (
            <View key={item.id} style={[S.tRow, i % 2 === 1 ? S.tRowAlt : {}]}>
              <View style={S.colProd}>
                <Text style={[S.tCell, { fontFamily: 'Helvetica-Bold' }]}>{item.product.name}</Text>
                {item.notes ? <Text style={[S.tCell, { color: '#64748b', fontSize: 7, marginTop: 1 }]}>{item.notes}</Text> : null}
              </View>
              <Text style={[S.tCell, S.colSku]}>{item.product.sku}</Text>
              <Text style={[S.tCell, S.colQty]}>{item.quantity} {item.unitType}</Text>
              <Text style={[S.tCell, S.colAvail, { color: item.isAvailable ? '#16a34a' : '#dc2626' }]}>
                {item.isAvailable ? 'Sí' : 'No'}
              </Text>
              <Text style={[S.tCell, S.colPrice]}>{fmt(item.salePrice)}</Text>
              <Text style={[S.tCell, S.colDays]}>{item.deliveryDays ? `${item.deliveryDays}d` : '—'}</Text>
              <Text style={[S.tCell, S.colSub, { fontFamily: 'Helvetica-Bold' }]}>{fmt(item.subtotal)}</Text>
            </View>
          ))}
        </View>

        {/* ── TOTALES ──────────────────────────────────────────────────────── */}
        <View style={S.totalsSection}>
          <View style={S.totalRow}>
            <Text style={S.totalKey}>Subtotal:</Text>
            <Text style={S.totalVal}>{fmt(quote.subtotal)}</Text>
          </View>
          {quote.fees > 0 && (
            <View style={S.totalRow}>
              <Text style={S.totalKey}>Fees / Cargos:</Text>
              <Text style={S.totalVal}>{fmt(quote.fees)}</Text>
            </View>
          )}
          <View style={[S.grandTotal, { width: 220 }]}>
            <Text style={S.gtKey}>TOTAL USD:</Text>
            <Text style={S.gtVal}>{fmt(quote.total)}</Text>
          </View>
        </View>

        {/* ── NOTAS ────────────────────────────────────────────────────────── */}
        {quote.notes && (
          <View style={S.notesBox}>
            <Text style={S.notesLabel}>Notas comerciales</Text>
            <Text style={S.notesText}>{quote.notes}</Text>
          </View>
        )}

        {/* ── TÉRMINOS ─────────────────────────────────────────────────────── */}
        <View style={S.terms}>
          <Text style={S.termsLabel}>Términos y condiciones</Text>
          <Text style={S.termsText}>
            1. Esta cotización tiene validez hasta la fecha indicada. Transcurrida la vigencia, los precios están sujetos a cambio.{'\n'}
            2. Los precios están expresados en dólares americanos (USD) y no incluyen impuestos locales aplicables.{'\n'}
            3. La disponibilidad de productos está sujeta a confirmación de inventario al momento del pedido.{'\n'}
            4. Los tiempos de entrega son estimados y pueden variar según disponibilidad logística.{'\n'}
            {/* REEMPLAZAR AQUÍ INFORMACIÓN DE PROMESA LATINA */}
            5. Para confirmar el pedido o resolver dudas, contactar a ventas@promesalatina.com.
          </Text>
        </View>

        {/* ── FOOTER ───────────────────────────────────────────────────────── */}
        <View style={S.footer} fixed>
          {/* REEMPLAZAR AQUÍ INFORMACIÓN DE PROMESA LATINA */}
          <Text style={S.footerText}>Promesa Latina  ·  ventas@promesalatina.com  ·  +1 (XXX) XXX-XXXX</Text>
          <Text style={S.footerText}>Cotización válida hasta {validDate}</Text>
        </View>

      </Page>
    </Document>
  )
}
