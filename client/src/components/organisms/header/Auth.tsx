import React from "react"
import useCurrentUser from "../../../hooks/useCurrentUser"

const Auth: React.FC = () => {
  const user = useCurrentUser()

  return (
    <>
      {user ? (
        user.username + user.avatar
      ) : (
        <a href={import.meta.env.VITE_API_BASE + "/connect/discord"}>Sign in</a>
      )}
    </>
  )
}

export default Auth
