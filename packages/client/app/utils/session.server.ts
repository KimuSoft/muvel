import { parse } from "cookie"
import { createCookie } from "react-router"
import type { User } from "muvel-api-types"
import { api } from "~/utils/api"
import { isAxiosError } from "axios"

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
    const response = await api.get<User>(`users/me`, {
      headers: { cookie },
    })
    return response.data
  } catch (err) {
    if (!isAxiosError(err)) {
      return console.error("Error fetching user data:", err)
    }

    if (err.response?.status === 401) return
    console.error("Error fetching user data:", err)
    return null
  }
}
