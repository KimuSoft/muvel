import React, { useMemo } from "react"
import {
  Center,
  Icon,
  Image,
  type ImageProps,
  Skeleton,
} from "@chakra-ui/react"
import { TbPhotoOff } from "react-icons/tb"
import { FaBookOpen } from "react-icons/fa6"

const Kimuage: React.FC<
  ImageProps & {
    isThumbnail?: boolean
    thumbnailWidth?: number
  }
> = ({ src, isThumbnail, thumbnailWidth, ...props }) => {
  const image = useMemo(() => {
    // 키뮈지 이미지 서버 URL이 아닌 경우
    if (!src?.toString().includes("image.kimustory.net")) return src

    let i = src + (isThumbnail ? "/thumbnail" : "/view")
    if (thumbnailWidth) {
      i += `?width=${thumbnailWidth}`
    }

    return i
  }, [src, isThumbnail, thumbnailWidth])

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
