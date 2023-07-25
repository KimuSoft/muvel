import React from "react"
import { Outlet } from "react-router-dom"
import GlobalContext from "../context/GlobalContext"
import { api } from "../utils/api"
import { User } from "../types/user.type"
import { Center, Spinner, useToast } from "@chakra-ui/react"
import { AiOutlineLoading3Quarters } from "react-icons/ai"
import { AxiosError } from "axios"

export const AppLayout: React.FC = () => {
  const [loading, setLoading] = React.useState(true)
  const [user, setUser] = React.useState<User | null>(null)

  const toast = useToast()

  React.useEffect(() => {
    ;(async () => {
      let user: User | null = null
      try {
        user = (await api.get("/users/me")).data
      } catch (e) {
        if (!(e instanceof AxiosError)) throw e
        switch (e.response?.status) {
          case 401:
            break
          default:
            toast({
              title: "알 수 없는 오류가 발생했습니다",
              description: e.message,
            })
        }
      }

      setUser(user)
    })().finally(() => setLoading(false))
  }, [])

  return (
    <>
      {loading ? (
        <Center w="100vw" h="100vh">
          <Spinner />
        </Center>
      ) : (
        <GlobalContext.Provider value={{ user }}>
          <Outlet />
        </GlobalContext.Provider>
      )}
    </>
  )
}
