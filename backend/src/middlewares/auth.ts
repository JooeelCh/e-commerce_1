import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import jwksRsa from "jwks-rsa";

const jwksClient = jwksRsa({
    jwksUri: `${process.env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`,
    cache: true,
    rateLimit: true,
})

function getKey(header: jwt.JwtHeader): Promise<string> {
    return new Promise((resolve, reject) => {
        jwksClient.getSigningKey(header.kid, (err, key) => {
            if (err) return reject(err)
            resolve(key!.getPublicKey())
        })
    })
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.replace("Bearer ", "")

    if (!token) {
        res.status(401).json({ error: "No autorizado" })
        return
    }

    try {
        const decoded = jwt.decode(token, { complete: true })
        const publicKey = await getKey(decoded!.header as jwt.JwtHeader)
        const verified = jwt.verify(token, publicKey, { algorithms: ["ES256"]})
        req.user = verified as any
        next()
    } catch (err){
        console.error("JWT error", err)
        res.status(401).json({ error: "Token invalido" })
    }
}