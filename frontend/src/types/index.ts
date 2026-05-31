export type Product = {
    id: string
    name: string
    description: string | null
    price: number
    image_url: string | null
    stock: number
    created_at: string
}

export type CartItem = {
    id: string
    user_id: string
    product_id: string
    quantity: number
    product: Product
}

export type Order = {
    id: string
    user_id: string
    total: number
    status: string
    stripe_session_id: string | null
    created_at: string
}