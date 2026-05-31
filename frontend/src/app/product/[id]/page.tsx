import { createSupabaseServer } from "@/lib/supabase-server";
import AddToCartButton from "@/components/AddToCartButton";
import Image from "next/image";
import { notFound } from "next/navigation";

async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createSupabaseServer()
    const { data: product } = await supabase.from('products').select('*').eq('id', id).single()

    if (!product) notFound()

    return (
        <main className="max-w-4xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="relative w-full h-80">
                    <Image
                        src={product.image_url ?? '/placeholder.png'}
                        alt={product.name}
                        fill
                        className="object-cover rounded-xl"
                    />
                </div>
                <div className="flex flex-col justify-center">
                    <h1 className="text-3xl font-semibold">{product.name}</h1>
                    <p className="text-gray-500 mt-3">{product.description}</p>
                    <p className="text-2xl font-bold mt-6">${product.price}</p>
                    <p className="text-sm text-gray-400 mt-1">Stock: {product.stock}</p>
                    <AddToCartButton product={product} />
                </div>
            </div>
        </main>
    )
}

export default ProductPage;