import React from "react"
import { MdLock } from "react-icons/md"
import useCurrentUser from "../../hooks/useCurrentUser"
import { Avatar, IconButton, Tooltip } from "@chakra-ui/react"

const Auth: React.FC = () => {
  const user = useCurrentUser()

  const loginClickHandler = () => {
    window.location.href = import.meta.env.VITE_API_BASE + "/auth/login"
  }

  const logoutClickHandler = () => {
    localStorage.removeItem("accessToken")
    window.location.reload()
  }

  return (
    <>
      {user ? (
        <>
          <Avatar
            cursor="pointer"
            size="sm"
            onClick={logoutClickHandler}
            name={user.username}
            src={user.avatar}
          />
        </>
      ) : (
        <Tooltip label={"로그인하기"}>
          <IconButton
            aria-label={"lock"}
            onClick={loginClickHandler}
            icon={<MdLock size={22} />}
            variant={"ghost"}
            borderRadius={"full"}
          />
        </Tooltip>
      )}
    </>
  )
}

export default Auth
