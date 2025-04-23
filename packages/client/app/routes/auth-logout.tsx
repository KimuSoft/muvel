import { authCookie } from "~/utils/session.server"
import { redirect } from "react-router"

export const action = async () => {
  const cookie = await authCookie.serialize("", {
    maxAge: 0, // 쿠키 제거!
  })

  return redirect("/", {
    headers: {
      "Set-Cookie": cookie,
    },
  })
}
