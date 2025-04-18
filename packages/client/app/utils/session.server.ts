import { parse } from "cookie"
import axios from "axios"
import { createCookie } from "react-router"
import type { User } from "~/types/user.type"
import { api } from "~/utils/api"

export const authCookie = createCookie("auth_token", {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
})

export async function getUserFromRequest(request: Request) {
  const cookie = request.headers.get("cookie") ?? ""

  const token = parse(cookie)["auth_token"]
  if (!token) return null

  try {
    const response = await api.get<User>(`auth/me`, {
      headers: { cookie },
    })
    return response.data
  } catch (err) {
    console.error("Error fetching user data:", err)
    return null
  }
}
