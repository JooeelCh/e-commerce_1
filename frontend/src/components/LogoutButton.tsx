'use client'

import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

function LogoutButton() {
    const router = useRouter()

    async function handleLogout() {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    return (
        <button onClick={handleLogout} className="text-gray-500 hover:underline">
            Cerrar sesion
        </button>
    )
}

export default LogoutButton;