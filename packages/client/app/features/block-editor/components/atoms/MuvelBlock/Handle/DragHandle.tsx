import { RxDragHandleDots2 } from "react-icons/rx"
import { forwardRef } from "react"
import { Box, type BoxProps, Center } from "@chakra-ui/react"
import { type LegacyBlock, LegacyBlockType } from "muvel-api-types"

const DragHandle = forwardRef<
  HTMLDivElement,
  BoxProps & { block: LegacyBlock }
>(({ block, onClick }, ref) => {
  return (
    <Center
      position="absolute"
      w="32px"
      h="40px"
      display="flex"
      alignItems="center"
      justifyContent="center"
      cursor="pointer"
      onClick={onClick}
      ref={ref}
    >
      {block.blockType !== LegacyBlockType.DoubleQuote ? (
        <Box
          w="32px"
          h="32px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          color={{ base: "gray.500", _dark: "gray.500" }}
          opacity={0}
          className="block-handle"
        >
          <RxDragHandleDots2 />
        </Box>
      ) : (
        <>
          <Box
            w="32px"
            h="32px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color={{ base: "gray.500", _dark: "gray.500" }}
            opacity={0}
            className="block-handle"
          >
            <RxDragHandleDots2 />
          </Box>

          {/* <Box
            w="32px"
            h="32px"
            borderRadius="full"
            bgSize="cover"
            bgColor="#71717a"
          /> */}
        </>
      )}
    </Center>
  )
})

export default DragHandle
