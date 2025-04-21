import * as rs from "react-spinners"
import { MotionCenter } from "~/components/atoms/motions"

const { PropagateLoader } = rs

const LoadingOverlay = () => {
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
      color={"red.500"}
    >
      <PropagateLoader color={"var(--chakra-colors-purple-300)"} />
    </MotionCenter>
  )
}

export default LoadingOverlay
