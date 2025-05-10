import React, { type PropsWithChildren } from "react"
import {
  Box,
  Button,
  Center,
  Heading,
  HStack,
  Icon,
  Image,
  Link,
  Mark,
  Spacer,
  Stack,
  Tag,
  Text,
  Wrap,
} from "@chakra-ui/react"
import Header from "../organisms/Header"
import Logo from "~/components/molecules/Logo"
import { TbLogin2 } from "react-icons/tb"
import { LuPackageSearch, LuPartyPopper } from "react-icons/lu"
import { FaDoorOpen } from "react-icons/fa6"
import { Tooltip } from "~/components/ui/tooltip"
import { usePlatform } from "~/hooks/usePlatform"
import { useLogin } from "~/hooks/useLogin"
import Footer from "~/components/organisms/Footer"

const BuyMeACoffeText = "Buy me a coffee!"

const SimpleTag: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <Tag.Root colorPalette={"purple"} variant={"solid"} size={"sm"}>
      <Tag.Label>{children}</Tag.Label>
    </Tag.Root>
  )
}

const InfoTemplate: React.FC<{
  userCount: number
}> = ({ userCount }) => {
  const { isTauri } = usePlatform()
  const login = useLogin()

  return (
    <Stack p={0}>
      <Header logo={false} />
      <Center w={"100%"} minH={"100vh"} px={3}>
        <Center flexDir={"column"} w={"100%"} maxW={"4xl"} gap={3} my={100}>
          <Tooltip
            content={`${userCount}명의 작가님과 함께하고 있어요! (Muvel v${import.meta.env.VITE_APP_VERSION})`}
            positioning={{
              placement: "top",
            }}
            openDelay={100}
            showArrow
          >
            <Logo w={{ base: 250, md: 300 }} cursor={"pointer"} slogan />
          </Tooltip>
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
                  뮤블 {isTauri ? "데스크탑" : "웹"}
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
                뮤블은 아직 얼리 액세스 중이에요! 미완성이라 정식 출시 전까지는
                불안정한 부분이 있을 수 있어요...!
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
                제공되고 있으며, 현재 <b>{userCount}명</b>의 작가님들과 함께하고
                있어요!
              </Text>
              <Text
                fontSize={"sm"}
                color={{ base: "gray.500", _dark: "gray.400" }}
                lineHeight={1.5}
              >
                업데이트를 위해 후원을 받는 거라면 몰라도, 사이트 전체를 유료로
                돌릴 예정은 없으니 마음껏 쓰세요!
              </Text>
              <Spacer />
              <Text fontSize={"xs"} color={"purple.500"}>
                현재 Google과 Discord 로그인만 가능해요!
              </Text>
              <Button colorPalette={"purple"} onClick={login}>
                <TbLogin2 />
                뮤블에 로그인하기
              </Button>
            </Stack>
          </HStack>

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

export default InfoTemplate
