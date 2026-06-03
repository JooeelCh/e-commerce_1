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
        const { items } = req.body

        if (!userId || !items?.length) {
            res.status(400).json({ error: "Faltan datos requeridos" })
            return
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

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${process.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/cart`,
            metadata: { userId }
        })

        const total = items.reduce((acc: number, item: {
            product: { price: number }
            quantity: number
        }) => acc + item.product.price * item.quantity, 0)

        const { error: orderError } =await supabase.from("orders").insert({
            user_id: userId,
            total,
            status: "pending",
            stripe_session_id: session.id
        })
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

        await supabase.from("orders").update({ status: "paid" }).eq("stripe_session_id", session.id)
        await supabase.from("cart_items").delete().eq("user_id", session.metadata?.userId)
    }

    res.json({ received: true })
})

export default router