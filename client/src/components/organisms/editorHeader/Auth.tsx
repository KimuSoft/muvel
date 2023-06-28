import React from "react"
import { MdLock } from "react-icons/md"
import useCurrentUser from "../../../hooks/useCurrentUser"
import IconButton from "../../atoms/IconButton"
import { Avatar, Text } from "@chakra-ui/react"

const Auth: React.FC = () => {
  const user = useCurrentUser()

  const loginClickHandler = () => {
    window.location.href = import.meta.env.VITE_API_BASE + "/auth/login/discord"
  }

  const logoutClickHandler = () => {
    localStorage.removeItem("accessToken")
    window.location.reload()
  }

  return (
    <>
      {user ? (
        <Avatar
          cursor="pointer"
          size="sm"
          onClick={logoutClickHandler}
          name={user.username}
          src={user.avatar}
        />
      ) : (
        <IconButton onClick={loginClickHandler}>
          <MdLock />
        </IconButton>
      )}
    </>
  )
}

export default Auth
