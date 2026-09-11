import './globals.css';
export const metadata = {
  title: 'VENDIX - Haz una foto. Vende más.',
  description: 'Convierte fotos de productos en contenido profesional con IA',
  openGraph: { title: 'VENDIX', description: 'Haz una foto. Vende más.', images: ['/og.png'] },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="es"><body className="bg-zinc-950 text-white antialiased">{children}</body></html>
}