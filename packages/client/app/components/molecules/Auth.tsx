import React from "react"
import {
  Avatar,
  IconButton,
  MenuContent,
  MenuItem,
  MenuPositioner,
  MenuRoot,
  MenuTrigger,
  Tag,
} from "@chakra-ui/react"
import { TbLogin2, TbLogout } from "react-icons/tb"
import { Tooltip } from "~/components/ui/tooltip"
import { useUser } from "~/providers/UserProvider"
import { FaUser } from "react-icons/fa6"
import { SiGoogledrive } from "react-icons/si"
import { useLogin } from "~/hooks/useLogin"
import { useLogout } from "~/hooks/useLogout"

const Auth: React.FC = () => {
  const user = useUser()
  const login = useLogin()
  const logout = useLogout()

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
              {user.admin && (
                <MenuItem
                  value={"admin"}
                  onClick={() => {
                    window.location.href = "/api/"
                  }}
                >
                  <TbLogin2 />
                  API 페이지{" "}
                  <Tag.Root colorPalette={"purple"}>
                    <Tag.Label>관리자</Tag.Label>
                  </Tag.Root>
                </MenuItem>
              )}
              {/* TODO: 구글 인증 받을 때까지 관리자만 */}
              {!user.googleDriveId && user.admin && (
                <MenuItem
                  value={"drive"}
                  onClick={() => {
                    window.location.href = "/api/google-drive/connect"
                  }}
                >
                  <SiGoogledrive />
                  소설 자동 백업 활성화{" "}
                  <Tag.Root colorPalette={"purple"}>
                    <Tag.Label>구글 드라이브</Tag.Label>
                  </Tag.Root>
                </MenuItem>
              )}
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
              <MenuItem value={"logout"} onClick={logout}>
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
            onClick={login}
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
