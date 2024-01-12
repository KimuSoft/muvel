import React, { FC, useEffect } from "react"
import { Outlet, useLocation } from "react-router-dom"
import GlobalContext from "../context/GlobalContext"
import { api } from "../utils/api"
import { User } from "../types/user.type"
import { Center, Spinner, useToast } from "@chakra-ui/react"
import { AxiosError } from "axios"
import { motion } from "framer-motion"

export const AppLayout: FC = () => {
  const [loading, setLoading] = React.useState(true)
  const [user, setUser] = React.useState<User | null>(null)
  const location = useLocation()

  const toast = useToast()

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      setLoading(false)
      return console.log("no token")
    }
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
    <motion.div
      key={location.pathname.replace(/sodes\/.*/, "")}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {loading ? (
        <Center w="100vw" h="100vh">
          <Spinner />
        </Center>
      ) : (
        <GlobalContext.Provider value={{ user }}>
          <Outlet />
        </GlobalContext.Provider>
      )}
    </motion.div>
  )
}
