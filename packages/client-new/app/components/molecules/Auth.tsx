import React from "react"
import { Avatar, IconButton } from "@chakra-ui/react"
import { TbLogin2 } from "react-icons/tb"
import { Tooltip } from "~/components/ui/tooltip"
import { useUser } from "~/context/UserContext"

const Auth: React.FC = () => {
  const user = useUser()

  const loginClickHandler = () => {
    window.location.href = "api/auth/login"
  }

  const logoutClickHandler = () => {
    localStorage.removeItem("accessToken")
    window.location.reload()
  }

  return (
    <>
      {user ? (
        <>
          <Avatar.Root cursor="pointer" size="sm" onClick={logoutClickHandler}>
            <Avatar.Image src={user.avatar} />
          </Avatar.Root>
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
