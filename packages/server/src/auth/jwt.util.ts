// auth/jwt.util.ts

import { Request } from "express"

export function extractTokenFromRequest(req: Request): string | null {
  const authHeader = req.headers.authorization
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null
  const cookieToken = req.cookies?.auth_token

  return bearerToken || cookieToken || null
}
