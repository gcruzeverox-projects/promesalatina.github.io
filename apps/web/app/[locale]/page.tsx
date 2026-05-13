// apps/web/app/[locale]/page.tsx
// Corregido: agrega setRequestLocale para habilitar static rendering

import { setRequestLocale } from 'next-intl/server'
import { Header } from '@/components/landing/Header'
import Link from 'next/link'

const locales = ['es', 'en']

export function generateStaticParams() {
  return locales.map(locale => ({ locale }))
}

export default async function LandingPage({
  params,
}: {
  params: { locale: string }
}) {
  // ✅ CLAVE: debe llamarse al inicio del componente de página también
  setRequestLocale(params.locale)

  return (
    <>
      <Header />
      <main style={{ overflowX: 'hidden', width: '100%' }}>

        {/* ── HERO ── */}
        <section style={{
          background: 'linear-gradient(135deg, #162b6e 0%, #1F3A93 55%, #2a4db5 100%)',
          padding: '72px 24px 80px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative' }}>
            
            <h1 style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: 'clamp(28px,5vw,46px)',
              fontWeight: 800, color: '#fff', lineHeight: 1.12,
              marginBottom: 18, letterSpacing: '-0.02em',
            }}>
              Abastece tu tienda con<br />
              <span style={{ color: '#FFB74D' }}>productos que tus clientes aman</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 16, maxWidth: 520, margin: '0 auto 32px', lineHeight: 1.7 }}>
              Importamos directamente desde Centroamérica y Sudamérica. Pedidos mínimos accesibles, cotización en minutos, entrega confiable.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="#catalog" style={{
                background: '#E65100', color: '#fff', padding: '13px 28px',
                borderRadius: 8, textDecoration: 'none', fontSize: 14,
                fontWeight: 700, fontFamily: 'Poppins, sans-serif',
              }}>📦 Explorar Catálogo</a>
              <a href="#contact" style={{
                background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '13px 28px',
                borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 600,
                border: '1.5px solid rgba(255,255,255,0.35)',
              }}>💬 Solicitar Cotización</a>
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <div style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', padding: '20px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}>
            {[['500+','Productos'],['7','Categorías'],['48h','Entrega est.'],['10+','Países origen']].map(([n,l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 24, fontWeight: 800, color: '#1F3A93', lineHeight: 1 }}>{n}</div>
                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CATEGORÍAS ── */}
        <section id="catalog" style={{ padding: '56px 24px', background: '#fff' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 24, fontWeight: 700, color: '#0F172A', margin: '0 0 6px' }}>
              Explorar por Categoría
            </h2>
            <p style={{ color: '#94A3B8', fontSize: 14, margin: '0 0 28px' }}>
              Categorías administrables desde el panel admin
            </p>
            <style>{`
              .cat-card {
                background: #F5F7FA;
                border: 1.5px solid #DDE3EE;
                border-radius: 12px;
                overflow: hidden;
                text-decoration: none;
                display: flex;
                flex-direction: column;
                transition: box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
              }
              .cat-card:hover {
                box-shadow: 0 8px 24px rgba(31, 58, 147, 0.13);
                transform: translateY(-4px);
                border-color: #1F3A93;
              }
              .cat-card:hover .cat-label {
                color: #1F3A93;
              }
              .cat-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 16px;
              }
              @media (max-width: 768px) {
                .cat-grid {
                  grid-template-columns: repeat(2, 1fr);
                  gap: 12px;
                }
                .cat-card .cat-label {
                  font-size: 12px !important;
                }
              }
            `}</style>
            <div className="cat-grid">
              {[
                { name: 'Bebidas',             sub: 'Jugos · Sodas · Energizantes',   slug: 'bebidas',            img: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=220&fit=crop&auto=format' },
                { name: 'Galletas & Snacks',   sub: 'Rosquillas · Churritos',         slug: 'galletas-snacks',    img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=220&fit=crop&auto=format' },
                { name: 'Pan & Repostería',    sub: 'Pan dulce · Tortillas',          slug: 'pan-reposteria',     img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=220&fit=crop&auto=format' },
                { name: 'Granos & Condimentos',sub: 'Frijoles · Arroz · Salsas',      slug: 'granos-condimentos', img: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=220&fit=crop&auto=format' },
                { name: 'Congelados',          sub: 'Pupusas · Tamales · Yuca',       slug: 'congelados',         img: 'https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?w=400&h=220&fit=crop&auto=format' },
                { name: 'Medicina & Salud',    sub: 'Remedios · Vitaminas',           slug: 'medicina-salud',     img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=220&fit=crop&auto=format' },
                { name: 'Nostalgia Latina',    sub: 'Marcas clásicas importadas',     slug: 'nostalgia-latina',   img: 'https://images.unsplash.com/photo-1583623025817-d180a2221d0a?w=400&h=220&fit=crop&auto=format' },
                { name: 'Ver Todo',            sub: 'Catálogo completo',              slug: 'all',                img: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=220&fit=crop&auto=format' },
              ].map(({ name, sub, slug, img }) => {
                const locale = params.locale
                const href = slug === 'all' ? `/${locale}/catalog` : `/${locale}/catalog?slug=${slug}`
                return (
                  <Link key={name} href={href} className="cat-card">
                    <div style={{ width: '100%', height: 140, overflow: 'hidden', flexShrink: 0 }}>
                      <img src={img} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    </div>
                    <div style={{ padding: '14px 16px 16px' }}>
                      <div className="cat-label" style={{ fontFamily: 'Poppins, sans-serif', fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 3, transition: 'color 0.2s ease' }}>
                        {name}
                      </div>
                      <div style={{ fontSize: 11, color: '#94A3B8' }}>{sub}</div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── CÓMO FUNCIONA ── */}
        <section id="about" style={{ padding: '56px 24px', background: '#F8FAFC' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 24, fontWeight: 700, margin: '0 0 28px', textAlign: 'center' }}>
              ¿Cómo funciona?
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
              {[
                ['1','Explora el catálogo','Navega cientos de productos latinos importados directamente desde Centroamérica y Sudamérica.'],
                ['2','Crea tu orden','Agrega productos a tu carrito B2B por caja o paquete. Recibe cotización personalizada en minutos.'],
                ['3','Recibe y vende','Tu pedido llega directo a tu tienda. Reordena con un clic desde tu historial.'],
              ].map(([n, t, d]) => (
                <div key={n} style={{ background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '28px 24px' }}>
                  <div style={{ width: 36, height: 36, background: '#1F3A93', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Poppins, sans-serif', fontSize: 16, fontWeight: 700, marginBottom: 16 }}>{n}</div>
                  <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 15, fontWeight: 600, color: '#0F172A', marginBottom: 8 }}>{t}</div>
                  <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.65, margin: 0 }}>{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section id="contact" style={{ background: '#1F3A93', padding: '56px 24px', textAlign: 'center' }}>
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 28, fontWeight: 700, color: '#fff', margin: '0 0 10px' }}>
              ¿Listo para abastecer tu tienda?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, margin: '0 0 28px' }}>
              Regístrate gratis o solicita una cotización personalizada.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href={`/${params.locale}/admin/login`} style={{
                background: '#E65100', color: '#fff', padding: '13px 28px',
                borderRadius: 8, textDecoration: 'none', fontSize: 14,
                fontWeight: 700, fontFamily: 'Poppins, sans-serif',
              }}>Contactar a ventas</a>
              <a href="#contact" style={{
                background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '13px 28px',
                borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 600,
                border: '1.5px solid rgba(255,255,255,0.35)',
              }}>Ver catálogo</a>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        {/* REEMPLAZAR AQUÍ INFORMACIÓN DE PROMESA LATINA */}
        <footer style={{ background: '#1E293B', color: 'rgba(255,255,255,0.7)', padding: '48px 24px 24px', fontSize: 13 }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 32, marginBottom: 36 }}>
              <div>
                <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 16, color: '#fff', marginBottom: 8 }}>
                  Promesa Latina
                </div>
                <p style={{ maxWidth: 240, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>
                  Distribuidora B2B de productos latinoamericanos para tiendas en EE.UU.
                </p>
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#fff', marginBottom: 12, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Contacto
                </div>
                <p style={{ margin: '0 0 6px' }}>📧 ventas@promesalatina.com</p>
                <p style={{ margin: '0 0 6px' }}>📞 +1 (XXX) XXX-XXXX</p>
                <p style={{ margin: 0 }}>📍 Los Ángeles, California</p>
              </div>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <span>© 2025 Promesa Latina. Todos los derechos reservados.</span>
              <div style={{ display: 'flex', gap: 16 }}>
                <a href="#" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Privacidad</a>
                <a href="#" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Términos</a>
              </div>
            </div>
          </div>
        </footer>

      </main>
    </>
  )
}
