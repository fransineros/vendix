"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Por ahora te manda al dashboard, luego conectamos Supabase
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-white mb-2">Bienvenido a Vendix</h1>
        <p className="text-zinc-400 mb-8">Entra a tu cuenta</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500"
            required
          />
          <button
            type="submit"
            className="w-full py-3 bg-pink-600 hover:bg-pink-500 text-white font-semibold rounded-xl transition"
          >
            Entrar
          </button>
        </form>

        <p className="text-center text-zinc-500 mt-6 text-sm">
          <Link href="/" className="text-pink-500 hover:text-pink-400">← Volver al inicio</Link>
        </p>
      </div>
    </div>
  )
}
