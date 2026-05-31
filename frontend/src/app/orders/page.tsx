import { createSupabaseServer } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

async function OrdersPage() {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect("/login")
    
    const { data: orders } = await supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false })

    return (
        <main className="max-w-3xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-semibold mb-6">Mis ordenes</h1>

            {!orders?.length ? (
                <p className="text-gray-500">No tenes ordenes todavia.</p>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => (
                        <div key={order.id} className="border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">
                                    {new Date(order.created_at).toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })}
                                </p>
                                <p className="font-medium mt-1">${order.total.toFixed(2)}</p>
                            </div>
                            <span className={`text-sm px-3 py-1 rounded-full ${order.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {order.status === 'paid' ? 'Pagada' : 'Pendiente'}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </main>
    )
}

export default OrdersPage;