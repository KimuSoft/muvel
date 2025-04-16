// app/routes/auth/callback.tsx
import { authCookie } from "~/utils/session.server"
import axios from "axios"
import { type ActionFunctionArgs, redirect } from "react-router"

export async function loader({ request }: ActionFunctionArgs) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")

  if (!code) {
    throw new Response("Missing code", { status: 400 })
  }

  try {
    const response = await axios.post(`${process.env.API_URL}/auth/callback`, {
      code,
    })

    const { accessToken } = response.data

    const cookie = await authCookie.serialize(accessToken)
    return redirect("/", {
      headers: { "Set-Cookie": cookie },
    })
  } catch (err) {
    console.error("OAuth error:", err)
    return redirect("/login")
  }
}
