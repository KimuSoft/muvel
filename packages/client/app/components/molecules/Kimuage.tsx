import React, { useMemo } from "react"
import { Center, Icon, Image, type ImageProps } from "@chakra-ui/react"
import { FaBookOpen } from "react-icons/fa6"
import { getKimuageUrl } from "~/utils/getKimuageUrl"

const Kimuage: React.FC<
  ImageProps & {
    isThumbnail?: boolean
    thumbnailWidth?: number
  }
> = ({ src, isThumbnail, thumbnailWidth, ...props }) => {
  const image = useMemo(
    () => getKimuageUrl(src, isThumbnail, thumbnailWidth),
    [src, isThumbnail, thumbnailWidth],
  )

  const [loaded, setLoaded] = React.useState(false)

  // if (!loaded)
  //   return <Skeleton w={"100%"} h={"150px"} {...props} />

  return src ? (
    <Image
      src={image}
      fit={"cover"}
      w={"100%"}
      onLoad={() => setLoaded(true)}
      {...props}
    />
  ) : (
    <Center
      w={"100%"}
      h={"150px"}
      bgColor={{ base: "gray.800", _light: "gray.100" }}
      {...props}
    >
      <Icon
        color={{
          base: "white",
          _dark: "gray.700",
        }}
        fontSize={"4xl"}
      >
        <FaBookOpen />
      </Icon>
    </Center>
  )
}

export default Kimuage
