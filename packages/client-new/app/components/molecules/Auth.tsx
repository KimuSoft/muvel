import React from "react"
import { Avatar, IconButton } from "@chakra-ui/react"
import { TbLogin2 } from "react-icons/tb"
import { Tooltip } from "~/components/ui/tooltip"

const Auth: React.FC = () => {
  // const user = useCurrentUser()

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
        <Tooltip content={"로그인하기"}>
          <IconButton
            aria-label={"lock"}
            onClick={loginClickHandler}
            variant={"ghost"}
            borderRadius={"full"}
          >
            <TbLogin2 size={22} />
          </IconButton>
        </Tooltip>
      )}
    </>
  )
}

export default Auth
