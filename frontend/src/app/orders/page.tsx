import { createSupabaseServer } from "@/lib/supabase-server";
import { Order } from "@/types";
import { redirect } from "next/navigation";

async function OrdersPage() {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect("/login")
    
    const { data: orders } = await supabase.from("orders").select(`*, order_items (id, quantity, unit_price, product: products (name, image_url))`).eq("user_id", user.id).order("created_at", { ascending: false })

    return (
        <main className="max-w-3xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-semibold mb-6">Mis ordenes</h1>

            {!orders?.length ? (
                <p className="text-gray-500">No tenes ordenes todavia.</p>
            ) : (
                <div className="space-y-4">
                    {(orders as Order[]).map(order => (
                        <div key={order.id} className="border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center justify-between mb-4">
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
                            
                            <div className="space-y-2 border-t border-gray-100 pt-4">
                                {order.order_items.map(item => (
                                    <div key={item.id} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-500">x{item.quantity}</span>
                                            <span>{item.product.name}</span>
                                        </div>
                                        <span className="text-gray-500">
                                            ${(item.unit_price * item.quantity).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    )
}

export default OrdersPage;