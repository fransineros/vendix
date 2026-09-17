export default function Home() {
  return (
    <div style={{ background: '#0a0a0a', color: 'white', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0' }}>
          <div style={{ fontWeight: 900, fontSize: '24px' }}>VENDIX</div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <a href="#features" style={{ color: '#aaa', textDecoration: 'none' }}>Features</a>
            <a href="#precios" style={{ color: '#aaa', textDecoration: 'none' }}>Precios</a>
            <a href="/dashboard" style={{ color: 'white', textDecoration: 'none', border: '1px solid #333', padding: '8px 16px', borderRadius: '8px' }}>Login</a>
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ display: 'inline-block', background: '#1a1a1a', border: '1px solid #333', padding: '8px 16px', borderRadius: '20px', fontSize: '14px' }}>
            Nuevo: IA para ecommerce
          </div>
          <h1 style={{ fontSize: '64px', fontWeight: 900, lineHeight: 1, margin: '20px 0' }}>
            Haz una foto.<br/>Vende más.
          </h1>
          <p style={{ color: '#999', fontSize: '18px', maxWidth: '600px', margin: '20px auto' }}>
            Convierte las fotos de tus productos en contenido profesional con Inteligencia artificial.
          </p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px' }}>
            <a href="/dashboard" style={{ background: 'linear-gradient(90deg, #8b5cf6, #ec4899)', color: 'white', padding: '14px 28px', borderRadius: '10px', textDecoration: 'none', fontWeight: 700 }}>Probar gratis</a>
            <a href="#precios" style={{ background: '#1a1a1a', color: 'white', padding: '14px 28px', borderRadius: '10px', textDecoration: 'none', border: '1px solid #333' }}>Ver planes</a>
          </div>
        </div>

        <div id="precios" style={{ textAlign: 'center', padding: '40px' }}>
          <a href="https://www.paypal.com/paypalme/fransineros" target="_blank" style={{ background: 'white', color: 'black', padding: '14px 28px', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, display: 'inline-block' }}>
            Pagar con PayPal - fransineros@gmail.com
          </a>
        </div>
      </div>
    </div>
  )
}
