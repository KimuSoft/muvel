import { IconButton, type IconButtonProps } from "@chakra-ui/react"
import React from "react"
import { useViewOptions } from "~/hooks/useAppOptions"
import { Tooltip } from "~/components/ui/tooltip"
import { TbSortAscending, TbSortDescending } from "react-icons/tb"

const SortToggleButton: React.FC<IconButtonProps> = (props) => {
  const [{ episodeListSortDirection: direction }, setOptions] = useViewOptions()

  return (
    <Tooltip
      content={`${direction === "asc" ? "내림차순" : "오름차순"} 정렬로 바꾸기`}
      openDelay={200}
    >
      <IconButton
        variant={"ghost"}
        gap={3}
        onClick={() =>
          setOptions((o) => {
            o.episodeListSortDirection = direction === "asc" ? "desc" : "asc"
          })
        }
        {...props}
      >
        {direction === "asc" ? <TbSortAscending /> : <TbSortDescending />}
      </IconButton>
    </Tooltip>
  )
}

export default SortToggleButton
