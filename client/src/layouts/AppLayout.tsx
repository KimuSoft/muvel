import React from "react"
import { Outlet } from "react-router-dom"
import GlobalContext from "../context/GlobalContext"
import { api } from "../utils/api"
import { User } from "../types/user.type"
import { Center } from "@chakra-ui/react"
import { AiOutlineLoading3Quarters } from "react-icons/all"

export const AppLayout: React.FC = () => {
  const [loading, setLoading] = React.useState(true)
  const [user, setUser] = React.useState<User | null>(null)

  React.useEffect(() => {
    ;(async () => {
      const { data } = await api.get("/users/me")

      setUser(data)
    })().finally(() => setLoading(false))
  }, [])

  return (
    <>
      {loading ? (
        <Center w="100vw" h="100vh">
          <AiOutlineLoading3Quarters size={32} />
        </Center>
      ) : (
        <GlobalContext.Provider value={{ user }}>
          <Outlet />
        </GlobalContext.Provider>
      )}
    </>
  )
}
