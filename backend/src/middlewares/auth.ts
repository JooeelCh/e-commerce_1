import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.replace("Bearer ", "")

    if (!token) {
        res.status(401).json({ error: "No autorizado" })
        return
    }

    try {
        const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET!)
        req.user = decoded as any
        next()
    } catch {
        res.status(401).json({ error: "Token invalido" })
    }
}