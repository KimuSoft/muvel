import { IconButton, type IconButtonProps } from "@chakra-ui/react"
import { TbSortAscending, TbSortDescending } from "react-icons/tb"
import React from "react"

export type SortType = "asc" | "desc"

const SortToggleButton: React.FC<
  IconButtonProps & {
    value: SortType
    onValueChange: (value: SortType) => void
  }
> = ({ value, onValueChange, ...props }) => {
  return (
    <IconButton
      variant={"ghost"}
      gap={3}
      onClick={() => onValueChange(value === "asc" ? "desc" : "asc")}
      {...props}
    >
      {value === "asc" ? <TbSortAscending /> : <TbSortDescending />}
    </IconButton>
  )
}

export default SortToggleButton
