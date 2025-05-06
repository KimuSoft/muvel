import { MotionCenter } from "~/components/atoms/motions"
import { Spinner, Text } from "@chakra-ui/react"
import React from "react"

const LoadingOverlay: React.FC<{ message?: string }> = ({ message }) => {
  return (
    <MotionCenter
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      position={"fixed"}
      left={0}
      top={0}
      w={"100vw"}
      h={"100vh"}
      bgColor={{ base: "whiteAlpha.700", _dark: "blackAlpha.700" }}
      zIndex={9999}
      key={"loading-overlay"}
      color={"purple.500"}
      display={"flex"}
      flexDirection={"column"}
    >
      {/*<PropagateLoader color={"var(--chakra-colors-purple-300)"} />*/}
      <Spinner size={"lg"} />
      {message && (
        <Text color={"purple.500"} mt={4} textAlign={"center"}>
          {message}
        </Text>
      )}
    </MotionCenter>
  )
}

export default LoadingOverlay
