import { IconButton, type IconButtonProps } from "@chakra-ui/react"
import { TbList, TbListDetails } from "react-icons/tb"
import React, { useMemo } from "react"
import type { EpisodeItemVariant } from "~/components/molecules/EpisodeItem"
import { BsFillGrid3X3GapFill } from "react-icons/bs"

const EpisodeListLayoutToggleButton: React.FC<
  IconButtonProps & {
    variants: EpisodeItemVariant[]
    value: EpisodeItemVariant
    onValueChange: (value: EpisodeItemVariant) => void
  }
> = ({ variants, value, onValueChange, ...props }) => {
  const icon = useMemo(() => {
    switch (value) {
      case "detail":
        return <TbListDetails />
      case "simple":
        return <TbList />
      case "shallow":
        return <TbListDetails />
      case "grid":
        return <BsFillGrid3X3GapFill />
      default:
        return <TbList />
    }
  }, [value])

  return (
    <IconButton
      variant={"ghost"}
      gap={3}
      onClick={() => {
        const nextIndex = (variants.indexOf(value) + 1) % variants.length
        onValueChange(variants[nextIndex])
      }}
      {...props}
    >
      {icon}
    </IconButton>
  )
}

export default EpisodeListLayoutToggleButton
