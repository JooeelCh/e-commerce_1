import { createSupabaseServer } from "@/lib/supabase-server"
import ProductCard from "@/components/ProductCard"
import AddToCartButton from "@/components/AddToCartButton"

async function HomePage() {

    const supabase = await createSupabaseServer()
    const { data: products, error} = await supabase.from('products').select('*').order('created_at', {ascending: false})

    if (error) {
        console.error(error)
        return <p>Error al cargar los productos</p>
    }

    return (
        <main className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-semibold mb-8">Catalogo</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                    <div key={product.id}>
                        <ProductCard key={product.id} product={product}></ProductCard>
                        <AddToCartButton product={product} />
                    </div>
                ))}
            </div>
        </main>
    )
}

export default HomePage;