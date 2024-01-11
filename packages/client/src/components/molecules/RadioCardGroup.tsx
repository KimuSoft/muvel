import React from "react"
import { HStack, useRadioGroup } from "@chakra-ui/react"
import RadioCard from "./RadioCard"

const RadioCardGroup: React.FC<{
  onChange(value: string): unknown
  defaultValue?: string
  options: RadioCardOption[]
}> = ({ onChange, defaultValue, options }) => {
  const [searchRange, setSearchRange] = React.useState<string>(
    defaultValue || options[0].value
  )

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: "range",
    defaultValue: defaultValue || options[0].value,
    onChange: (value: string) => {
      setSearchRange(value)
      onChange(value)
      return
    },
  })

  const group = getRootProps()

  return (
    <HStack {...group} flexShrink="0">
      {options.map((value) => {
        const radio = getRadioProps({ value: value.value })
        return (
          <RadioCard key={value.value} {...radio}>
            {value.label}
          </RadioCard>
        )
      })}
    </HStack>
  )
}
export interface RadioCardOption {
  value: string
  label: string | JSX.Element
}

export default RadioCardGroup
