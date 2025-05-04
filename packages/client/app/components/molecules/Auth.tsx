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
import { useUser } from "~/context/UserContext"
import { FaUser } from "react-icons/fa6"
import axios from "axios"
import { SiGoogledrive } from "react-icons/si"
import { usePlatform } from "~/hooks/usePlatform"
import { openUrl } from "@tauri-apps/plugin-opener"

const Auth: React.FC = () => {
  const user = useUser()
  const { isTauri } = usePlatform()

  const loginClickHandler = () => {
    if (isTauri) {
      void openUrl(`https://${process.env.VITE_API_BASE}/auth/login`)
    } else {
      window.location.href = "/api/auth/login"
    }
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
              {!!user.googleDriveId && (
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
              <MenuItem
                value={"logout"}
                onClick={async () => {
                  await axios.post(
                    `${window.location.protocol}//${window.location.host}/auth/logout`,
                  )
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
