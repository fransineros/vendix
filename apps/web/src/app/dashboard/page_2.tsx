export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Hola, Demo 👋</h1>
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6"><div className="text-zinc-400 text-sm">Créditos</div><div className="text-3xl font-black mt-2">3</div></div>
        <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6"><div className="text-zinc-400 text-sm">Productos</div><div className="text-3xl font-black mt-2">12</div></div>
        <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6"><div className="text-zinc-400 text-sm">Plan</div><div className="text-xl font-bold mt-2">FREE</div></div>
      </div>
      <a href="/dashboard/products/new" className="mt-8 inline-flex rounded-full bg-violet-600 px-6 py-3 font-medium">+ Nuevo producto</a>
    </div>
  )
}