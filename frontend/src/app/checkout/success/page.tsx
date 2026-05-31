import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase-server";

async function SuccessPage({
    searchParams
}: {
    searchParams: Promise<{ session_id? : string }>
}) {
    
    const { session_id } = await searchParams
    const supabase = await createSupabaseServer()

    const { data: order } = session_id ? await supabase.from("orders").select("*").eq("stripe_session_id", session_id).single() : { data: null }

    return (
        <main className="max-w-lg mx-auto px-4 py-16 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-3xl font-semibold mb-4">Compra exitosa</h1>
            <p className="text-gray-500 mb-6">Tu orden fue procesada con éxito</p>

            {order && (
                <div className="border border-gray-200 rounded-xl p-4 mb-8 text-left">
                    <p className="text-sm text-gray-400">Numero de orden</p>
                    <p className="font-mono text-sm mt-1">{order.id}</p>
                    <p className="text-sm text-gray-400 mt-3">Total pagado</p>
                    <p className="font-semibold text-lg">{order.total.toFixed(2)}</p>
                </div>
            )}

            <div className="flex gap-4 justify-center">
                <Link href="/orders" className="border border-gray-200 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors">Ver mis ordenes</Link>
                <Link href="/" className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors">Seguir comprando</Link>
            </div>
        </main>
    )
}

export default SuccessPage;