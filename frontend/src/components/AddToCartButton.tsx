'use client'

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useCart } from "@/hooks/useCart"
import { Product } from "@/types"

function AddToCartButton({ product }: { product: Product }) {
    const [userId, setUserId] = useState<string | null>(null)
    const { addToCart } = useCart(userId)

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setUserId(data.user?.id ?? null)
        })
    }, [])

    if (!userId) {
        return (
            <a href="/login" className="mt-6 block text-center bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors">
                Inicia sesion para comprar
            </a>
        )
    }

    if (product.stock === 0) {
        return (
            <button disabled className="mt-6 w-full bg-gray-200 text-gray-400 py-3 rounded-lg cursor-not-allowed">
                Sin stock
            </button>
        )
    }

    return (
        <button onClick={() => addToCart(product.id)} className="mt-6 bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors w-full">
            Agregar al carrito
        </button>
    )
}

export default AddToCartButton;