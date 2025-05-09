import React, { createContext, useContext, useEffect } from "react"
import type { User } from "muvel-api-types"
import { getMe } from "~/services/api/api.user"
import LoadingOverlay from "~/components/templates/LoadingOverlay"

const UserContext = createContext<User | null>(null)

export function UserProvider({
  user: user_,
  children,
}: {
  user: User | null
  children: React.ReactNode
}) {
  const [user, setUser] = React.useState<User | null>(user_)
  const [isLoading, setIsLoading] = React.useState(true)

  const fetchUser = async () => {
    setIsLoading(true)
    const user = await getMe()
    if (user) setUser(user)
    else localStorage.removeItem("auth_token")
    setIsLoading(false)
  }

  useEffect(() => {
    if (!user && localStorage.getItem("auth_token")) {
      void fetchUser()
    } else {
      setIsLoading(false)
    }
  }, [user_])

  if (isLoading) return <LoadingOverlay />

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>
}

export function useUser() {
  return useContext(UserContext)
}
