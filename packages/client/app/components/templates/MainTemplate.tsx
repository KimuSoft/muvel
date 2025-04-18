import React, { useMemo, useState } from "react"
import {
  Button,
  Center,
  Heading,
  HStack,
  Input,
  InputGroup,
  SimpleGrid,
  Spacer,
  VStack,
} from "@chakra-ui/react"
import Header from "../organisms/Header"
import { BiSearch } from "react-icons/bi"
import type { Novel } from "~/types/novel.type"
import { useNavigate } from "react-router"
import Logo from "~/components/molecules/Logo"
import { useUser } from "~/context/UserContext"
import BlockLink from "~/components/atoms/BlockLink"
import NovelItem from "~/components/molecules/NovelItem"
import CreateNovelItem from "~/components/molecules/CreateNovelItem"
import CreateNovelModal from "~/components/modals/CreateNovelModal"
import { IoLibrary } from "react-icons/io5"
import { FaHistory } from "react-icons/fa"

const MainTemplate: React.FC<{
  novels: Novel[]
}> = ({ novels }) => {
  const user = useUser()

  const [searchQuery, setSearchQuery] = useState<string>("")

  const navigate = useNavigate()

  const searchedNovels = useMemo(() => {
    if (searchQuery === "") return novels
    return novels.filter((novel) => novel.title.includes(searchQuery))
  }, [searchQuery, novels])

  return (
    <VStack w={"100%"} h={"100vh"} px={7}>
      <Header logo={false} />
      <Center
        flexDir={"column"}
        h={"100%"}
        w={"100%"}
        maxW={"4xl"}
        gap={3}
        my={200}
      >
        <Logo w={{ base: 250, md: 300 }} slogan />
        {/*<HStack w={"100%"} maxW={"2xl"} mt={5}>*/}
        {/*<InputGroup flex={1} endElement={<BiSearch size={20} />}>*/}
        {/*  <Input*/}
        {/*    borderColor={{ base: "gray.200", _dark: "gray.700" }}*/}
        {/*    placeholder="검색어를 입력해주세요"*/}
        {/*    onChange={(e) => setSearchQuery(e.target.value)}*/}
        {/*    onKeyDown={(e) => {*/}
        {/*      if (e.key !== "Enter") return*/}
        {/*      navigate("/search?q=" + searchQuery)*/}
        {/*    }}*/}
        {/*  />*/}
        {/*</InputGroup>*/}
        {/*</HStack>*/}
        <HStack
          color={{ base: "gray.400", _dark: "gray.500" }}
          w={"100%"}
          gap={3}
          px={2}
          mt={5}
        >
          <FaHistory />
          <Heading fontWeight={500} fontSize={"md"}>
            최근 변경된 소설
          </Heading>
          <Spacer />
          <Button
            size={"sm"}
            variant={"outline"}
            flexShrink={0}
            colorScheme={"purple"}
            onClick={() => navigate("/my-novels")}
          >
            <IoLibrary />내 도서관
          </Button>
        </HStack>
        <SimpleGrid w={"100%"} minChildWidth={"250px"} gap={2} mt={1}>
          {novels.slice(0, 5).map((novel) => (
            <BlockLink key={novel.id} to={"/novels/" + novel.id}>
              <NovelItem novel={novel} />
            </BlockLink>
          ))}
          <CreateNovelModal>
            <CreateNovelItem />
          </CreateNovelModal>
        </SimpleGrid>
      </Center>
    </VStack>
  )
}

export default MainTemplate
