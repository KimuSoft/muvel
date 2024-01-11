import React, { useEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"

const AuthCallback: React.FC = () => {
  const location = useLocation()
  const isFirst = useRef(true)

  const navigate = useNavigate()

  useEffect(() => {
    if (!isFirst.current) return

    isFirst.current = false

    const params = new URLSearchParams(location.search)

    const accessToken = params.get("token")

    if (!accessToken) {
      toast.error("액세스 토큰을 찾을 수 없습니다")
      navigate("/novels")
      return
    }

    localStorage.accessToken = accessToken
    navigate("/novels")
  }, [isFirst.current, location.search])

  return <>Redirecting...</>
}

export default AuthCallback
