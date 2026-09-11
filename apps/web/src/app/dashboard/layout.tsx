'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/products', label: 'Mis productos' },
  { href: '/dashboard/products/new', label: 'Crear producto' },
  { href: '/dashboard/credits', label: 'Créditos' },
  { href: '/pricing', label: 'Planes' },
];
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen">
      <aside className="hidden md:flex w-64 flex-col border-r border-white/10 bg-zinc-900 p-6 gap-2">
        <div className="font-black text-xl mb-8">VENDIX</div>
        {links.map(l => <Link key={l.href} href={l.href} className={`rounded-xl px-4 py-2 text-sm ${pathname===l.href?'bg-white text-black':'text-zinc-400 hover:bg-white/10'}`}>{l.label}</Link>)}
      </aside>
      <div className="flex-1 bg-zinc-950">
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-6">
          <div className="text-sm text-zinc-400">3 créditos • Plan FREE</div>
          <div className="h-8 w-8 rounded-full bg-violet-600" />
        </header>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}