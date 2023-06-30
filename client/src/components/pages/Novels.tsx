import React, { useEffect } from "react"
import {
  Box,
  Center,
  Container,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  Skeleton,
  Spacer,
  Text,
  useRadioGroup,
  VStack,
} from "@chakra-ui/react"
import NovelCard from "../molecules/NovelCard"
import { api } from "../../utils/api"
import { Novel } from "../../types/novel.type"
import RadioCard from "../molecules/RadioCard"
import Header from "../organisms/Header"
import useCurrentUser from "../../hooks/useCurrentUser"
import { BiSearch } from "react-icons/bi"
import CreateNovel from "../organisms/CreateNovel"

const NovelsPage: React.FC = () => {
  const user = useCurrentUser()

  const [novels, setNovels] = React.useState<Novel[]>([])
  const [searchRange, setSearchRange] = React.useState<"내 소설" | "모든 소설">(
    "내 소설"
  )
  const [loading, setLoading] = React.useState<boolean>(false)

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: "range",
    defaultValue: "내 소설",
    onChange: (value: string) => {
      setSearchRange(value as "내 소설" | "모든 소설")
      return
    },
  })

  const group = getRootProps()

  const fetchNovels = async () => {
    if (!user) return
    setLoading(true)
    const { data } = await api.get<Novel[]>(
      searchRange === "내 소설" ? `users/${user.id}/novels` : "novels"
    )
    setNovels(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchNovels().then()
  }, [searchRange])

  return (
    <>
      <Header />
      <Container
        display="flex"
        flexDirection="column"
        maxW="7xl"
        gap={10}
        pt={5}
      >
        <HStack spacing={5}>
          <HStack {...group} flexShrink="0">
            {["모든 소설", "내 소설"].map((value) => {
              const radio = getRadioProps({ value })
              return (
                <RadioCard key={value} {...radio}>
                  {value}
                </RadioCard>
              )
            })}
          </HStack>
          <InputGroup maxW="2xl">
            <Input placeholder="검색어를 입력해보세요. 아 참고로 작동은 안 해요" />
            <InputRightElement>
              <BiSearch />
            </InputRightElement>
          </InputGroup>
          <Spacer />
          <CreateNovel />
        </HStack>
        {!loading ? (
          novels.length ? (
            <Box
              display="flex"
              flexWrap="wrap"
              gap="20px"
              justifyContent="center"
            >
              {novels.map((novel) => (
                <NovelCard novel={novel} key={novel.id} />
              ))}
            </Box>
          ) : (
            <Center h="400px">
              <Text color="gray.500" fontSize="2xl">
                으음... 소설이 없네요
              </Text>
            </Center>
          )
        ) : (
          <Box
            display="flex"
            flexWrap="wrap"
            gap="20px"
            justifyContent="center"
          >
            <NovelCardsSkeleton />
          </Box>
        )}
      </Container>
    </>
  )
}

const NovelCardsSkeleton: React.FC = () => {
  return (
    <>
      {Array.from({ length: 12 }).map((_, i) => (
        <VStack key={`novel-card-skeleton-${i}`}>
          <Skeleton w={187} h="250px"></Skeleton>
          <Skeleton w={187} h="20px"></Skeleton>
        </VStack>
      ))}
    </>
  )
}

export default NovelsPage
