import React from "react"
import {
  Button,
  Center,
  Heading,
  HStack,
  Link,
  Spacer,
  Stack,
  Text,
} from "@chakra-ui/react"
import Header from "../organisms/Header"
import type { Novel } from "muvel-api-types"
import { useNavigate } from "react-router"
import Logo from "~/components/molecules/Logo"
import { useUser } from "~/context/UserContext"
import BlockLink from "~/components/atoms/BlockLink"
import NovelItem from "~/components/molecules/NovelItem"
import CreateNovelItem from "~/components/molecules/CreateNovelItem"
import CreateNovelModal from "~/components/modals/CreateNovelModal"
import { IoLibrary } from "react-icons/io5"
import { FaHistory } from "react-icons/fa"
import { motion } from "motion/react"
import { MotionBox, MotionSimpleGrid } from "~/components/atoms/motions"

const MainTemplate: React.FC<{
  novels: Novel[]
}> = ({ novels }) => {
  const user = useUser()
  const navigate = useNavigate()

  return (
    <Stack>
      <Header logo={false} />
      <Center w={"100%"} minH={"100vh"} px={3}>
        <Center flexDir={"column"} w={"100%"} maxW={"4xl"} gap={3} my={100}>
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
          <MotionSimpleGrid w={"100%"} minChildWidth={"250px"} gap={2} mt={1}>
            {novels.slice(0, 5).map((novel) => (
              <motion.div key={novel.id}>
                <BlockLink key={novel.id} to={"/novels/" + novel.id}>
                  <NovelItem novel={novel} />
                </BlockLink>
              </motion.div>
            ))}
            {user ? (
              <CreateNovelModal>
                <CreateNovelItem />
              </CreateNovelModal>
            ) : (
              <MotionBox
                cursor={"pointer"}
                onClick={() => (window.location.href = "api/auth/login")}
              >
                <CreateNovelItem />
              </MotionBox>
            )}
          </MotionSimpleGrid>
          <HStack mt={8} gap={3} fontSize={"sm"} color={"gray.400"}>
            <Text>
              Made by{" "}
              <Link
                variant={"underline"}
                href={"https://kimustory.net"}
                colorPalette={"purple"}
              >
                Kimustory
              </Link>
            </Text>
            <Text>·</Text>
            <Text>
              <Link
                variant={"underline"}
                href={"https://discord.gg/kQ27qbCJ6V"}
              >
                Official Discord
              </Link>
            </Text>
          </HStack>
        </Center>
      </Center>
    </Stack>
  )
}

export default MainTemplate
