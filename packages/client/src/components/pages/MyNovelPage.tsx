import React, { useEffect } from "react"
import useCurrentUser from "../../hooks/useCurrentUser"
import { api } from "../../utils/api"
import { Novel } from "../../types/novel.type"
import MyNovelTemplate from "../templates/MyNovelTemplate"
import { useNavigate } from "react-router-dom"

const MainPage: React.FC = () => {
  const user = useCurrentUser()

  const [novels, setNovels] = React.useState<Novel[]>([])
  const [loading, setLoading] = React.useState<boolean>(false)

  const navigate = useNavigate()

  const fetchNovels = async () => {
    if (!user) return setNovels([])

    setLoading(true)
    const { data } = await api.get<Novel[]>(`users/${user?.id}/novels`)
    setNovels(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchNovels().then()
  }, [])

  if (!user) {
    window.location.href = import.meta.env.VITE_API_BASE + "/auth/login"
    return null
  }

  return <MyNovelTemplate user={user} novels={novels} isLoading={loading} />
}

export default MainPage
