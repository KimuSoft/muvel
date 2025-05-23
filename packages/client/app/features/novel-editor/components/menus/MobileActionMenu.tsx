import React from "react"
import { IconButton, Menu, type UseDialogReturn } from "@chakra-ui/react"
import { TbMessage, TbMoon, TbSun } from "react-icons/tb"
import { FaEllipsis } from "react-icons/fa6"
import { BiExport, BiHistory, BiSearch } from "react-icons/bi"
import { PiGear } from "react-icons/pi"
import { useColorMode } from "~/components/ui/color-mode"

const MobileActionMenu: React.FC<{
  searchDialog: UseDialogReturn
  commentDialog: UseDialogReturn
  exportDialog: UseDialogReturn
  snapshotDialog: UseDialogReturn
  settingDialog: UseDialogReturn
  isLocalNovel?: boolean
}> = ({
  searchDialog,
  commentDialog,
  exportDialog,
  snapshotDialog,
  settingDialog,
  isLocalNovel,
}) => {
  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <Menu.Root
      onSelect={(e) => {
        switch (e.value) {
          case "setting":
            console.log('"setting"')
            settingDialog.setOpen(true)
            break
          case "search":
            console.log('"search"')
            searchDialog.setOpen(true)
            break
          case "review":
            console.log('"review"')
            commentDialog.setOpen(true)
            break
          case "export":
            console.log('"export"')
            exportDialog.setOpen(true)
            break
          case "snapshot":
            console.log('"snapshot"')
            snapshotDialog.setOpen(true)
            break
          case "color-mode":
            console.log('"color-mode"')
            toggleColorMode()
            break
        }
      }}
    >
      <Menu.Trigger asChild>
        <IconButton
          aria-label="create"
          variant="ghost"
          size="md"
          display={{ base: "flex", md: "none" }}
        >
          <FaEllipsis />
        </IconButton>
      </Menu.Trigger>

      <Menu.Positioner>
        <Menu.Content>
          <Menu.Item value="search">
            <BiSearch /> 소설 검색하기
          </Menu.Item>
          <Menu.Item value="review" disabled={isLocalNovel}>
            <TbMessage /> 리뷰 보기
          </Menu.Item>
          <Menu.Item value="export">
            <BiExport /> 회차 내보내기
          </Menu.Item>
          <Menu.Item value="snapshot">
            <BiHistory /> 버전 관리하기
          </Menu.Item>
          <Menu.Item value="setting">
            <PiGear /> 에디터 설정하기
          </Menu.Item>
          <Menu.Item value="color-mode">
            {colorMode === "dark" ? <TbSun /> : <TbMoon />}{" "}
            {colorMode === "dark" ? "라이트모드" : "다크모드"}로 전환하기
          </Menu.Item>
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>
  )
}

export default MobileActionMenu
