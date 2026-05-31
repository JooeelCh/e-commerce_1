import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase-server";
import LogoutButton from "./LogoutButton";

async function Navbar() {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    let cartCount = 0
    if (user) {
        const { count } = await supabase.from("cart_items").select("*", { count: "exact", head: true }).eq("user_id", user.id)
        cartCount = count ?? 0
    }

    return (
        <nav className="border-b border-gray-200 px-4 py-3">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
                <Link href="/" className="font-semibold text-lg">E-Commerce</Link>
                <div className="flex items-center gap-4 text-sm">
                    <Link href="/cart" className="relative">
                        Carrito {cartCount > 0 && (
                            <span className="absolute -top-2 -right-4 bg-black text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                    {user ? (
                        <>
                            <Link href="/orders">Mis ordenes</Link>
                            <LogoutButton />
                        </>
                    ) : (
                        <Link href="/login">Iniciar sesion</Link>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default Navbar;