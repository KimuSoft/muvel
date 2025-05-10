export const getKimuageUrl = (
  src?: string,
  isThumbnail?: boolean,
  thumbnailWidth?: number,
) => {
  // 키뮈지 이미지 서버 URL이 아닌 경우
  if (!src?.toString().includes("image.kimustory.net")) return src
  let i = src + (isThumbnail ? "/thumbnail" : "/view")
  if (thumbnailWidth) {
    i += `?width=${thumbnailWidth}`
  }
  return i
}
