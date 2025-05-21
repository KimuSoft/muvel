import React from "react"
import { Menu, type MenuRootProps } from "@chakra-ui/react"
import { FaBookOpen, FaStarOfLife } from "react-icons/fa6"
import { GoMoveToEnd, GoMoveToStart } from "react-icons/go"
import { EpisodeType } from "muvel-api-types"

const EpisodeTypeMenu: React.FC<
  MenuRootProps & { episodeType: EpisodeType }
> = ({ episodeType, children, ...props }) => {
  return (
    <Menu.Root {...props}>
      <Menu.Trigger asChild>{children}</Menu.Trigger>
      <Menu.Positioner>
        <Menu.Content>
          {episodeType !== EpisodeType.Episode && (
            <Menu.Item value={EpisodeType.Episode.toString()}>
              <FaBookOpen />
              일반 회차로 지정
            </Menu.Item>
          )}
          {episodeType !== EpisodeType.Prologue && (
            <Menu.Item value={EpisodeType.Prologue.toString()}>
              <GoMoveToStart />
              프롤로그로 지정
            </Menu.Item>
          )}
          {episodeType !== EpisodeType.Epilogue && (
            <Menu.Item value={EpisodeType.Epilogue.toString()}>
              <GoMoveToEnd />
              에필로그로 지정
            </Menu.Item>
          )}
          {episodeType !== EpisodeType.Special && (
            <Menu.Item value={EpisodeType.Special.toString()}>
              <FaStarOfLife />
              특별편으로 지정
            </Menu.Item>
          )}
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>
  )
}

export default EpisodeTypeMenu
