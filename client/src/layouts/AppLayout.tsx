import React from "react"
import { Outlet } from "react-router-dom"
import GlobalContext from "../context/GlobalContext"
import { IUser } from "../types"
import { api } from "../utils/api"

export const AppLayout: React.FC = () => {
  const [loading, setLoading] = React.useState(true)
  const [user, setUser] = React.useState<IUser | null>(null)

  React.useEffect(() => {
    ;(async () => {
      const { data } = await api.get("/users/me")

      setUser(data)
    })().finally(() => setLoading(false))
  }, [])

  return (
    <>
      {loading ? (
        "Loading..."
      ) : (
        <GlobalContext.Provider value={{ user }}>
          <Outlet />
        </GlobalContext.Provider>
      )}
    </>
  )
}
