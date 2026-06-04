'use client'

import { useEffect, useState } from "react"
import { useCart } from "@/hooks/useCart"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

function CartPage() {
    const [userId, setUserId] = useState<string | null>(null)
    const [checkoutLoading, setCheckoutLoading] = useState(false)
    const { cart, loading: cartLoading, removeFromCart, total } = useCart(userId)

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setUserId(data.user?.id ?? null)
        })
    }, [])

    async function handleCheckout() {
        if (!userId) return
        setCheckoutLoading(true)

        try {
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) throw new Error("No hay sesion activa")

            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/create-checkout-session`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ items: cart })
            })

            const { url, error } = await res.json()
            if (error) throw new Error(error)
            window.location.href = url
        } catch (err) {
            console.error(err)
        } finally {
            setCheckoutLoading(false)
        }
    }

    if (cartLoading) return <p className="p-8">Cargando...</p>

    if (!userId) {
        return (
            <main className="max-w-2xl mx-auto px-4 py-8">
                <p>Tenes que <Link href="/login" className="underline">Iniciar sesion</Link></p>
            </main>
        )
    }

    if (cart.length === 0) return (
        <main className="max-w-2xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-semibold mb-4">Tu carrito</h1>
            <p className="text-gray-500">El carrito esta vacio.</p>
        </main>
    )

    return (
        <main className="max-w-2xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-semibold mb-6">Tu carrito</h1>
            <div className="space-y-4">
                {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between border-b pb-4">
                        <div>
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                            <button onClick={() => removeFromCart(item.id)} className="text-red-500 text-sm hover:underline">
                                Eliminar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-6 flex items-center justify-between">
                <span className="text-xl font-semibold">Total: ${total.toFixed(2)}</span>
                <button onClick={handleCheckout} disabled={checkoutLoading} className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50">
                    {checkoutLoading ? "Procesando..." : `Pagar $${total.toFixed(2)}`}
                </button>
            </div>
        </main>
    )
}

export default CartPage;