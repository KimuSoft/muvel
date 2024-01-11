import React, { useEffect } from "react"
import MainTemplate from "../templates/MainTemplate"
import useCurrentUser from "../../hooks/useCurrentUser"
import { api } from "../../utils/api"
import { Novel } from "../../types/novel.type"

const MainPage: React.FC = () => {
  const user = useCurrentUser()

  const [novels, setNovels] = React.useState<Novel[]>([])
  const [loading, setLoading] = React.useState<boolean>(false)

  const fetchNovels = async () => {
    if (!user) {
      return setNovels([])
    }

    setLoading(true)
    const { data } = await api.get<Novel[]>(`users/${user?.id}/novels`)
    setNovels(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchNovels().then()
  }, [])

  return <MainTemplate user={user} novels={novels} isLoading={loading} />
}

export default MainPage
