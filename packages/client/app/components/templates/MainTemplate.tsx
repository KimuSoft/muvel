import React, { type ReactNode } from "react"
import {
  Box,
  Center,
  Heading,
  HStack,
  Icon,
  Image,
  Stack,
  type StackProps,
  Text,
  useDialog,
  VStack,
} from "@chakra-ui/react"
import Header from "../organisms/Header"
import type { Novel } from "muvel-api-types"
import { useNavigate } from "react-router"
import Logo from "~/components/molecules/Logo"
import BlockLink from "~/components/atoms/BlockLink"
import NovelItem from "~/components/molecules/NovelItem"
import { IoLibrary } from "react-icons/io5"
import { motion } from "motion/react"
import { MotionSimpleGrid } from "~/components/atoms/motions"
import { TbPencilPlus } from "react-icons/tb"
import CreateNovelDialog from "~/components/modals/CreateNovelDialog"
import { Tooltip } from "~/components/ui/tooltip"
import Footer from "~/components/organisms/Footer"
import type { GetLocalNovelDetailsResponse } from "~/services/tauri/types"

const BuyMeACoffeText = "Buy me a coffee!"

const NovelItemActionButton: React.FC<
  { icon: ReactNode; title: string; description: string } & StackProps
> = ({ icon, title, description, ...props }) => {
  return (
    <HStack
      rounded={5}
      w={"100%"}
      h={"100%"}
      cursor={"pointer"}
      userSelect={"none"}
      borderWidth={1}
      className={"group"}
      borderColor={"transparent"}
      overflow={"none"}
      transition={"border-color 0.2s"}
      {...props}
    >
      <Center
        w="100px"
        h={"100%"}
        borderRadius={"md"}
        backgroundColor={{ base: "gray.200", _dark: "gray.900" }}
        backgroundSize={"cover"}
        backgroundPosition={"center"}
        flexShrink={0}
        transition={"background-color 0.2s"}
        _groupHover={{
          bgColor: { base: "purple.500", _dark: "purple.500" },
        }}
      >
        <Icon color={{ base: "white", _dark: "gray.800" }} fontSize={"4xl"}>
          {icon}
        </Icon>
      </Center>
      <VStack gap={0.5} px={3} py={2}>
        <HStack w={"100%"}>
          <Heading color={"purple.500"} fontSize={"sm"}>
            {title}
          </Heading>
        </HStack>
        <Text color={"gray.500"} fontSize={"xs"}>
          {description}
        </Text>
      </VStack>
    </HStack>
  )
}

const MainTemplate: React.FC<{
  novels: (Novel | GetLocalNovelDetailsResponse)[]
}> = ({ novels }) => {
  const navigate = useNavigate()
  const createNovelDialog = useDialog()

  return (
    <Stack p={0}>
      <Header logo={false} />
      <Center w={"100%"} minH={"100vh"} px={3}>
        <Center flexDir={"column"} w={"100%"} maxW={"4xl"} gap={3} my={100}>
          <Tooltip
            content={`Muvel v${import.meta.env.VITE_APP_VERSION}`}
            positioning={{
              placement: "top",
            }}
            openDelay={100}
            showArrow
          >
            <Logo w={{ base: 250, md: 300 }} cursor={"pointer"} slogan />
          </Tooltip>
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
          <MotionSimpleGrid w={"100%"} minChildWidth={"250px"} gap={2} mt={8}>
            {novels.slice(0, 5).map((novel) => (
              <motion.div key={novel.id}>
                <BlockLink key={novel.id} to={"/novels/" + novel.id}>
                  <NovelItem novel={novel} />
                </BlockLink>
              </motion.div>
            ))}
            <VStack gap={2}>
              <CreateNovelDialog dialog={createNovelDialog} />
              <NovelItemActionButton
                icon={<TbPencilPlus />}
                title={"새 소설 쓰기"}
                description={"새 아이디어가 있으신가요?"}
                onClick={() => createNovelDialog.setOpen(true)}
              />
              <NovelItemActionButton
                icon={<IoLibrary />}
                title={"내 도서관 가기"}
                description={"내 소설을 모두 볼 수 있어요!"}
                onClick={() => navigate("/my-novels")}
              />
            </VStack>
          </MotionSimpleGrid>

          <Footer />

          <HStack color={"gray.400"} fontSize={"sm"}></HStack>
          <Box
            position={{ base: undefined, md: "fixed" }}
            bottom={5}
            right={5}
            zIndex={1}
          >
            <Tooltip
              content={"뮤블 개발자에게 커피 사주기!"}
              openDelay={0}
              showArrow
            >
              <a
                href="https://www.buymeacoffee.com/kimustory?amount=3&utm_source=muvel&utm_medium=link&utm_campaign=muvel"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  mt={3}
                  h={"40px"}
                  src={`https://img.buymeacoffee.com/button-api/?text=${BuyMeACoffeText}&emoji=☕️&slug=kimustory&button_colour=BD5FFF&font_colour=ffffff&font_family=Cookie&outline_colour=000000&coffee_colour=FFDD00`}
                  alt="Buy Me a Coffee"
                />
              </a>
            </Tooltip>
          </Box>
        </Center>
      </Center>
    </Stack>
  )
}

export default MainTemplate
