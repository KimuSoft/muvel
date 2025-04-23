import React from "react"
import {
  Avatar,
  IconButton,
  MenuContent,
  MenuItem,
  MenuPositioner,
  MenuRoot,
  MenuTrigger,
} from "@chakra-ui/react"
import { TbLogin2, TbLogout } from "react-icons/tb"
import { Tooltip } from "~/components/ui/tooltip"
import { useUser } from "~/context/UserContext"
import { useNavigate } from "react-router"
import { FaUser } from "react-icons/fa6"
import { api } from "~/utils/api"
import axios from "axios"

const Auth: React.FC = () => {
  const user = useUser()
  const navigate = useNavigate()

  const loginClickHandler = () => {
    window.location.href = "api/auth/login"
  }

  return (
    <>
      {user ? (
        <MenuRoot>
          <MenuTrigger>
            <Avatar.Root cursor="pointer" size="sm">
              <Avatar.Image src={user.avatar} />
            </Avatar.Root>
          </MenuTrigger>
          <MenuPositioner>
            <MenuContent>
              <MenuItem
                value={"profile"}
                onClick={() =>
                  (window.location.href =
                    "https://accounts.kimustory.net/settings")
                }
              >
                <FaUser />
                프로필 수정하기
              </MenuItem>
              <MenuItem
                value={"logout"}
                onClick={async () => {
                  await axios.post("auth/logout")
                  window.location.href = "/"
                }}
              >
                <TbLogout />
                로그아웃
              </MenuItem>
            </MenuContent>
          </MenuPositioner>
        </MenuRoot>
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
