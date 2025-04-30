import React, { type PropsWithChildren, type ReactNode } from "react"
import {
  Button,
  Center,
  Heading,
  HStack,
  Icon,
  Link,
  Mark,
  Spacer,
  Stack,
  type StackProps,
  Tag,
  Text,
  useDialog,
  VStack,
  Wrap,
} from "@chakra-ui/react"
import Header from "../organisms/Header"
import type { Novel } from "muvel-api-types"
import { useNavigate } from "react-router"
import Logo from "~/components/molecules/Logo"
import { useUser } from "~/context/UserContext"
import BlockLink from "~/components/atoms/BlockLink"
import NovelItem from "~/components/molecules/NovelItem"
import { IoLibrary } from "react-icons/io5"
import { motion } from "motion/react"
import { MotionSimpleGrid } from "~/components/atoms/motions"
import { TbLogin2, TbPencilPlus } from "react-icons/tb"
import CreateNovelDialog from "~/components/modals/CreateNovelDialog"
import { LuPackageSearch, LuPartyPopper } from "react-icons/lu"
import { FaDoorOpen } from "react-icons/fa6"

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

const SimpleTag: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <Tag.Root colorPalette={"purple"} variant={"solid"} size={"sm"}>
      <Tag.Label>{children}</Tag.Label>
    </Tag.Root>
  )
}

const MainTemplate: React.FC<{
  novels: Novel[]
  userCount: number
}> = ({ novels, userCount }) => {
  const user = useUser()
  const navigate = useNavigate()
  const createNovelDialog = useDialog()

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
          {user ? (
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
          ) : (
            <HStack mt={7} flexDir={{ base: "column", md: "row" }}>
              <Stack
                rounded={8}
                w={"100%"}
                minW={"280px"}
                p={5}
                borderWidth={1}
                h={"350px"}
              >
                <Icon fontSize={"4xl"} color={"purple.500"}>
                  <LuPartyPopper />
                </Icon>
                <Heading mt={3}>
                  <Mark variant={"solid"} colorPalette={"purple"}>
                    뮤블
                  </Mark>
                  에 어서오세요!
                </Heading>
                <Text
                  fontSize={"sm"}
                  color={{ base: "gray.500", _dark: "gray.400" }}
                  lineHeight={1.5}
                >
                  <b>뮤블(Muvel)</b>은 웹소설 작가님들을 위해{" "}
                  <Link href={"https://kimustory.net"} colorPalette={"purple"}>
                    키뮤스토리
                  </Link>
                  에서 개발한 <b>온라인 소설 편집기</b>
                  예요!
                </Text>
                <Text
                  fontSize={"sm"}
                  color={{ base: "gray.500", _dark: "gray.400" }}
                  lineHeight={1.5}
                >
                  불필요한 기능이 많고 무거운 일반 워드프로세서에 비해, 웹소설
                  작성에 특화된 여러 기능을 가지고 있어요!
                </Text>
                <Spacer />
                <Text fontSize={"xs"} color={"purple.500"}>
                  뮤블은 아직 얼리 액세스 중이에요! 미완성이라 정식 출시
                  전까지는 불안정한 부분이 있을 수 있어요...!
                </Text>
              </Stack>
              <Stack
                rounded={8}
                w={"100%"}
                minW={"280px"}
                p={5}
                borderWidth={1}
                h={"350px"}
              >
                <Icon fontSize={"4xl"} color={"purple.500"}>
                  <LuPackageSearch />
                </Icon>
                <Heading mt={3}>
                  <Mark variant={"solid"} colorPalette={"purple"}>
                    무슨 기능
                  </Mark>
                  이 있나요?
                </Heading>
                <Text
                  fontSize={"sm"}
                  color={{ base: "gray.500", _dark: "gray.400" }}
                  lineHeight={1.5}
                >
                  <b>뮤블</b>에는 여러가지 기능이 있어요!
                </Text>
                <Wrap gap={1}>
                  <SimpleTag>실시간 클라우드</SimpleTag>
                  <SimpleTag>크로스플랫폼 지원</SimpleTag>
                  <SimpleTag>에디터 위젯</SimpleTag>
                  <SimpleTag>타입라이터</SimpleTag>
                  <SimpleTag>빠른 따옴표</SimpleTag>
                  <SimpleTag>에디터 커스텀</SimpleTag>
                  <SimpleTag>회차 내보내기</SimpleTag>
                  <SimpleTag>플롯 에디터</SimpleTag>
                  <SimpleTag>AI 리뷰</SimpleTag>
                  <SimpleTag>버전 관리</SimpleTag>
                  <SimpleTag>기호 자동 대치</SimpleTag>
                  <SimpleTag>소설 공유</SimpleTag>
                </Wrap>
                <Text
                  fontSize={"sm"}
                  color={{ base: "gray.500", _dark: "gray.400" }}
                  lineHeight={1.5}
                >
                  ...등등 이거 외에도 많은 기능이 있고, 피드백을 받아 계속
                  추가되고 있어요!
                </Text>
              </Stack>
              <Stack
                rounded={8}
                w={"100%"}
                minW={"280px"}
                p={5}
                borderWidth={1}
                h={"350px"}
              >
                <Icon fontSize={"4xl"} color={"purple.500"}>
                  <FaDoorOpen />
                </Icon>
                <Heading mt={3}>
                  지금{" "}
                  <Mark variant={"solid"} colorPalette={"purple"}>
                    시작해봐요!
                  </Mark>
                </Heading>
                <Text
                  fontSize={"sm"}
                  color={{ base: "gray.500", _dark: "gray.400" }}
                  lineHeight={1.5}
                >
                  <b>뮤블</b>은 작가님들이 더욱 편하게 글을 쓸 수 있도록 무료로
                  제공되고 있으며, 현재 <b>{userCount}명</b>의 작가님들과
                  함께하고 있어요!
                </Text>
                <Text
                  fontSize={"sm"}
                  color={{ base: "gray.500", _dark: "gray.400" }}
                  lineHeight={1.5}
                >
                  업데이트를 위해 후원을 받는 거라면 몰라도, 사이트 전체를
                  유료로 돌릴 예정은 없으니 마음껏 쓰세요!
                </Text>
                <Spacer />
                <Text fontSize={"xs"} color={"purple.500"}>
                  현재 Google과 Discord 로그인만 가능해요!
                </Text>
                <Button
                  colorPalette={"purple"}
                  onClick={() => {
                    window.location.href = `/api/auth/login`
                  }}
                >
                  <TbLogin2 />
                  뮤블에 로그인하기
                </Button>
              </Stack>
            </HStack>
          )}

          <HStack mt={8} gap={3} fontSize={"sm"} color={"gray.400"}>
            <Text>
              Made by{" "}
              <Link href={"https://kimustory.net"} colorPalette={"purple"}>
                Kimustory
              </Link>
            </Text>
            {/*<Text>·</Text>*/}
            {/*<Link color={"gray.500"} href={"https://discord.gg/kQ27qbCJ6V"}>*/}
            {/*  Official Discord*/}
            {/*</Link>*/}
            <Text>·</Text>
            <Text>{userCount}명의 작가님과 함께하고 있어요!</Text>
          </HStack>
        </Center>
      </Center>
    </Stack>
  )
}

export default MainTemplate
