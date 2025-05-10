import {
  MenuContent,
  MenuItem,
  MenuPositioner,
  MenuRoot,
  type MenuRootProps,
  MenuTrigger,
} from "@chakra-ui/react"
import { EpisodeType } from "muvel-api-types"
import React from "react"

const CreateEpisodeMenu: React.FC<MenuRootProps> = ({ children, ...props }) => {
  return (
    <MenuRoot {...props}>
      <MenuTrigger asChild>{children}</MenuTrigger>
      <MenuPositioner>
        <MenuContent>
          <MenuItem value={EpisodeType.Episode.toString()}>에피소드</MenuItem>
          <MenuItem value={EpisodeType.EpisodeGroup.toString()}>
            에피소드 그룹
          </MenuItem>
        </MenuContent>
      </MenuPositioner>
    </MenuRoot>
  )
}

export default CreateEpisodeMenu
