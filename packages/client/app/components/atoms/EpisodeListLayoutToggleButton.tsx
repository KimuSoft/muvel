import { IconButton, type IconButtonProps, Menu } from "@chakra-ui/react"
import React, { useMemo } from "react"
import { useViewOptions } from "~/hooks/useAppOptions"
import { TbList, TbListDetails } from "react-icons/tb"
import { EpisodeListLayout } from "~/types/options"
import { LuGrid2X2 } from "react-icons/lu"
import { Tooltip } from "~/components/ui/tooltip"

const layoutVariants = [
  {
    value: EpisodeListLayout.Detail,
    label: "자세히 보기",
    icon: <TbListDetails />,
  },
  {
    value: EpisodeListLayout.Simple,
    label: "간단히 보기",
    icon: <TbList />,
  },
  {
    value: EpisodeListLayout.Grid,
    label: "그리드 뷰",
    icon: <LuGrid2X2 />,
  },
]

const EpisodeListLayoutToggleButton: React.FC<IconButtonProps> = (props) => {
  const [{ episodeListLayout }, setOptions] = useViewOptions()

  const icon = useMemo(() => {
    const variant = layoutVariants.find((v) => v.value === episodeListLayout)
    return variant ? variant.icon : <TbListDetails />
  }, [episodeListLayout])

  return (
    <Menu.Root>
      <Menu.Trigger>
        <Tooltip content={"에피소드 목록 레이아웃"} openDelay={300}>
          <IconButton variant={"ghost"} as={"div"} {...props}>
            {icon}
          </IconButton>
        </Tooltip>
      </Menu.Trigger>
      <Menu.Positioner>
        <Menu.Content>
          {layoutVariants.map((variant) => (
            <Menu.Item
              key={variant.value}
              value={variant.value}
              onClick={() => {
                setOptions((o) => {
                  o.episodeListLayout = variant.value
                })
              }}
            >
              {variant.icon}
              {variant.label}
            </Menu.Item>
          ))}
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>
  )
}

export default EpisodeListLayoutToggleButton
