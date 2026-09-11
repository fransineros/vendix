import Link from 'next/link';
export default function Home() {
  return (
    <main>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto max-w-7xl flex h-16 items-center justify-between px-6">
          <div className="font-black tracking-tight text-xl">VENDIX</div>
          <nav className="hidden md:flex gap-6 text-sm text-zinc-400"><a href="#features">Features</a><a href="#pricing">Precios</a></nav>
          <div className="flex gap-3"><Link href="/login" className="px-4 py-2 text-sm">Login</Link><Link href="/dashboard" className="rounded-full bg-violet-600 px-5 py-2 text-sm font-medium">Probar gratis</Link></div>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-6 py-24 grid md:grid-cols-2 gap-12">
        <div>
          <span className="inline-flex rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-300">Nuevo: IA para ecommerce</span>
          <h1 className="mt-6 text-5xl font-black leading-[0.9] tracking-tight">VENDIX<br/>Haz una foto.<br/><span className="text-violet-400">Vende más.</span></h1>
          <p className="mt-6 text-lg text-zinc-400">Convierte las fotos de tus productos en contenido profesional con inteligencia artificial.</p>
          <div className="mt-8 flex gap-3"><Link href="/dashboard/products/new" className="rounded-full bg-white text-black px-6 py-3 font-medium">Probar gratis</Link><Link href="/pricing" className="rounded-full border border-white/20 px-6 py-3">Ver planes</Link></div>
        </div>
        <div className="relative rounded-[2rem] border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-800 p-6">Mock before/after - ver artefacto completo</div>
      </section>
    </main>
  )
}