import React, { PropsWithChildren } from "react"
import { Box, useColorModeValue, useRadio } from "@chakra-ui/react"

const RadioCard: React.FC<PropsWithChildren<{}>> = (props) => {
  // @ts-ignore
  const { getInputProps, getRadioProps } = useRadio(props)

  const input = getInputProps()
  const radio = getRadioProps()

  return (
    <Box as="label">
      <input {...input} />
      <Box
        {...radio}
        cursor="pointer"
        borderWidth="1px"
        borderRadius="md"
        border="none"
        bgColor={useColorModeValue("gray.200", "gray.600")}
        _checked={{
          bg: "purple.600",
          color: "white",
        }}
        _focus={{
          boxShadow: "outline",
        }}
        px={5}
        py={2.5}
      >
        {props.children}
      </Box>
    </Box>
  )
}

export default RadioCard
