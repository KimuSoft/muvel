import React, { useMemo } from "react"
import { Center, Image, type ImageProps, Skeleton } from "@chakra-ui/react"
import { TbPhotoOff } from "react-icons/tb"

const Kimuage: React.FC<
  ImageProps & {
    isThumbnail?: boolean
    thumbnailWidth?: number
  }
> = ({ src, isThumbnail, thumbnailWidth, ...props }) => {
  const image = useMemo(() => {
    let i = src + (isThumbnail ? "/thumbnail" : "/view")
    if (thumbnailWidth) {
      i += `?width=${thumbnailWidth}`
    }

    return i
  }, [src, isThumbnail, thumbnailWidth])

  const [loaded, setLoaded] = React.useState(false)

  return src ? (
    <Skeleton loading={!loaded} flexShrink={0}>
      <Image
        src={image}
        fit={"cover"}
        w={"100%"}
        onLoad={() => setLoaded(true)}
        {...props}
      />
    </Skeleton>
  ) : (
    <Center
      w={"100%"}
      h={"150px"}
      bgColor={{ base: "gray.800", _light: "gray.100" }}
      {...props}
    >
      <TbPhotoOff color={"gray"} size={32} />
    </Center>
  )
}

export default Kimuage
