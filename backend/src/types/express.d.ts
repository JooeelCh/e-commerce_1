import { User } from "@supabase/supabase-js";

declare global {
    namespace Express {
        interface Request {
            user?: {
                sub: string
                email?: string
                role?: string
                iat?: number
                exp?: number
                [key: string]: unknown
            }
        }
    }
}