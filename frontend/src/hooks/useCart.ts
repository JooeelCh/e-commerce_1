'use client'

import { supabase } from '@/lib/supabase'
import { CartItem } from '@/types'
import { useState, useEffect, useCallback } from 'react'

export function useCart(userId: string | null) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCart = useCallback(async () => {
    if (!userId) {
      setCart([])
      setLoading(false)
      return
    }
    const { data } = await supabase
      .from('cart_items')
      .select('*, product:products(*)')
      .eq('user_id', userId)
    setCart(data ?? [])
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  async function addToCart(productId: string) {
    if (!userId) return

    const existing = cart.find(item => item.product_id === productId)

    const { error } = await supabase
      .from('cart_items')
      .upsert(
        {
          user_id: userId,
          product_id: productId,
          quantity: (existing?.quantity ?? 0) + 1
        },
        { onConflict: 'user_id,product_id' }
      )

    console.log('upsert error:', error)
    fetchCart()
  }

  async function removeFromCart(cartItemId: string) {
    await supabase.from('cart_items').delete().eq('id', cartItemId)
    fetchCart()
  }

  async function clearCart() {
    await supabase.from('cart_items').delete().eq('user_id', userId)
    setCart([])
  }

  const total = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0)

  return { cart, loading, addToCart, removeFromCart, clearCart, total }
}