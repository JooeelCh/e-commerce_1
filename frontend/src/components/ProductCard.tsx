'use client'

import { Product } from "@/types"
import Image from "next/image"
import Link from "next/link"

function ProductCard({ product }: { product: Product }) {
    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative w-full h-48">
                <Image
                    src={product.image_url || "/placeholder.png"}
                    alt={product.name}
                    fill
                    className="object-cover" 
                />
            </div>
            <div className="p-4">
                <h2 className="front-medium text-lg">{product.name}</h2>
                <p className="text-gray-500 text-sm mt-1 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between mt-4">
                    <span className="text-xl font-semibold">${product.price}</span>
                    <Link href={`/product/${product.id}`} className="bg-black text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                        Ver detalles
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default ProductCard;