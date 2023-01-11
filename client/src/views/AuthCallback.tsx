import React, { useEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { api } from "../utils/api"

const AuthCallback: React.FC = () => {
  const location = useLocation()
  const isFirst = useRef(true)

  const navigate = useNavigate()

  useEffect(() => {
    if (!isFirst.current) return

    isFirst.current = false

    const params = new URLSearchParams(location.search)

    const accessToken = params.get("access_token")

    if (!accessToken) {
      toast.error("액세스 토큰을 찾을 수 없습니다")
      navigate("/")
      return
    }

    toast
      .promise(
        async () => {
          const {
            data: { jwt, user },
          } = await api.get("/auth/discord/callback", {
            params: {
              access_token: accessToken,
            },
          })

          localStorage.accessToken = jwt
        },
        {
          pending: "로그인하는 중...",
          error: "인증 실패",
          success: "로그인 성공!",
        }
      )
      .finally(() => navigate("/"))

    console.log(accessToken)
  }, [isFirst.current, location.search])

  return <>Redirecting...</>
}

export default AuthCallback
