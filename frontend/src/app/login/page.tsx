'use client'

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isRegister, setIsRegister] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleSubmit() {
        setError(null)
        setLoading(true)

        try {
            const { error } = isRegister ? await supabase.auth.signUp({ email, password }) : await supabase.auth.signInWithPassword({ email, password })

            if (error) throw error

            router.push('/')
            router.refresh()
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message)
            } else {
                setError("Ocurrio un error inesperado")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="max-w-sm mx-auto px-4 py-16">
            <h1 className="text-2xl font-semibold mb-6">{isRegister ? "Crear cuenta" : "Iniciar sesion"}</h1>

            <div>
                <input 
                    type="email" 
                    placeholder="Correo electronico" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-black" 
                />
                <input 
                    type="password" 
                    placeholder="Constraseña" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-black" 
                />

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button 
                    onClick={handleSubmit} 
                    disabled={loading} 
                    className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                    {loading ? "Cargando..." : isRegister ? "Registrarse" : "Iniciar sesion"}
                </button>

                <button onClick={() => setIsRegister(!isRegister)} className="w-full text-sm text-gray-500 hover:underline">
                    {isRegister ? "¿Ya tienes una cuenta? Inicia sesion" : "¿No tienes una cuenta? Registrate"}
                </button>
            </div>
        </main>
    )
}

export default LoginPage;