import { ColorPicker, HStack, parseColor } from "@chakra-ui/react"
import React from "react"

const OptionColorPicker: React.FC<{
  defaultValue: string | null
  onChange(value: string | null): void
}> = ({ defaultValue, onChange }) => {
  return (
    <ColorPicker.Root
      defaultValue={defaultValue ? parseColor(defaultValue) : undefined}
      onValueChange={(color) => onChange(color.value.toString("hex"))}
      maxW="200px"
    >
      <ColorPicker.HiddenInput />
      <ColorPicker.Control>
        <ColorPicker.Input />
        <ColorPicker.Trigger />
      </ColorPicker.Control>
      <ColorPicker.Positioner>
        <ColorPicker.Content>
          <ColorPicker.Area />
          <HStack>
            <ColorPicker.EyeDropper size="xs" variant="outline" />
            <ColorPicker.Sliders />
          </HStack>
        </ColorPicker.Content>
      </ColorPicker.Positioner>
    </ColorPicker.Root>
  )
}

export default OptionColorPicker
