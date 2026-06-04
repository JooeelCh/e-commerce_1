import express from "express"
import { Router } from "express";
import type { Router as RouterType } from "express";
import type { Request, Response } from "express";
import { stripe } from "../lib/stripe.js";
import { createClient } from "@supabase/supabase-js";
import { authMiddleware } from "../middlewares/auth.js";
import type Stripe from "stripe";

const router: RouterType = Router()

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
)

router.post("/create-checkout-session",authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.sub
        const { items } = req.body ?? {}

        if (!userId || !items?.length) {
            res.status(400).json({ error: "Faltan datos requeridos" })
            return
        }

        if (!items?.length) {
            res.status(400).json({ error: "El carrito está vacío" })
            return
        }

        for (const item of items) {
            const { data: product, error } = await supabase.from("products").select("stock, name").eq("id", item.product_id).single()

            if (error || !product) {
                res.status(400).json({ error: `Producto no encontrado: ${item.product_id}` })
                return
            }

            if (product.stock < item.quantity) {
                res.status(400).json({ error: `Stock insufieciente para "${product.name}". Disponible: ${product.stock}`})
                return
            }
        }

        const lineItems = items.map((item: {
            product: { name: string; image_url: string | null; price: number }
            quantity: number
        }) => ({
            price_data: {
                currency: "usd",
                product_data: {
                    name: item.product.name,
                    images: item.product.image_url ? [item.product.image_url] : []
                },
                unit_amount: Math.round(item.product.price * 100)
            },
            quantity: item.quantity
        }))

        
        const total = items.reduce((acc: number, item: {
            product: { price: number }
            quantity: number
        }) => acc + item.product.price * item.quantity, 0)
        
        const { data: order, error: orderError } = await supabase.from("orders").insert({ user_id: userId, total, status: "pending", stripe_session_id: null }).select().single()
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${process.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/cart`,
            metadata: { userId, orderId: order.id }
        })

        await supabase.from("orders").update({ stripe_session_id: session.id }).eq("id", order.id)

        if (orderError || !order) {
            console.error("Error insertando orden", orderError)
            res.status(500).json({ error: "Error al crear la orden" })
            return
        }

        
        const orderItems = items.map((item: {
            product_id: string
            product: { price: number }
            quantity: number
        }) => ({
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.product.price
        }))

        const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

        if (itemsError) {
            console.error("Error insertando order_items", itemsError)
        }

        res.json({ url: session.url })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Error al crear la sesion de pago" })
    }
})

router.post("/webhook", express.raw({ type: "application/json" }), async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string
    let event

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
    } catch (err) {
        console.error("webhook error", err)
        res.status(400).send("Webhook error")
        return
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session
        const { userId, orderId } = session.metadata ?? {}

        await supabase.from("orders").update({ status: "paid" }).eq("stripe_session_id", session.id)
        await supabase.from("cart_items").delete().eq("user_id", userId)

        const { data: orderItems } = await supabase
            .from("order_items")
            .select("product_id, quantity")
            .eq("order_id", orderId)

        if (orderItems) {
            for (const item of orderItems) {
                const { error: stockError} = await supabase.rpc("decrease_stock", {
                    p_product_id: item.product_id,
                    p_amount: item.quantity
                })
            }
        }
    }

    res.json({ received: true })
})

export default router