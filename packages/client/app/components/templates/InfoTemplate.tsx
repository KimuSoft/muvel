import React from "react"
import {
  Button,
  Center,
  Heading,
  HStack,
  Icon,
  Image,
  Link,
  Mark,
  Menu,
  SimpleGrid,
  Spacer,
  Stack,
  Tag,
  Text,
  VStack,
} from "@chakra-ui/react"
import Header from "../organisms/Header"
import Logo from "~/components/molecules/Logo"
import {
  TbArrowRight,
  TbBrandApple,
  TbBrandGooglePlay,
  TbBrandWindows,
  TbDownload,
  TbHistory,
  TbShare,
} from "react-icons/tb"
import { Tooltip } from "~/components/ui/tooltip"
import { useLogin } from "~/hooks/useLogin"
import Footer from "~/components/organisms/Footer"
import { useUser } from "~/context/UserContext"
import { SiBuymeacoffee, SiIos, SiLinux } from "react-icons/si"
import BlockLink from "~/components/atoms/BlockLink"
import {
  MdDarkMode,
  MdDevices,
  MdMoneyOff,
  MdOutlineVerticalAlignCenter,
  MdOutlineWidgets,
  MdWifi,
  MdWifiOff,
} from "react-icons/md"
import { FaPenFancy } from "react-icons/fa6"
import { IoColorPalette, IoSparklesSharp } from "react-icons/io5"
import { GoWorkflow } from "react-icons/go"
import { BsQuote } from "react-icons/bs"

// <Stack
// rounded={8}
// w={"100%"}
// minW={"280px"}
// p={5}
// borderWidth={1}
// h={"350px"}
//   >
//   <Icon fontSize={"4xl"} color={"purple.500"}>
//   <LuPackageSearch />
//   </Icon>
// <Heading mt={3}>
//   <Mark variant={"solid"} colorPalette={"purple"}>
//     무슨 기능
//   </Mark>
//   이 있나요?
// </Heading>
// <Text
//   fontSize={"sm"}
//   color={{ base: "gray.500", _dark: "gray.400" }}
//   lineHeight={1.5}
// >
//   <b>뮤블</b>에는 여러가지 기능이 있어요!
// </Text>
// <Wrap gap={1}>
//   <SimpleTag>실시간 클라우드</SimpleTag>
//   <SimpleTag>크로스플랫폼 지원</SimpleTag>
//   <SimpleTag>에디터 위젯</SimpleTag>
//   <SimpleTag>타입라이터</SimpleTag>
//   <SimpleTag>빠른 따옴표</SimpleTag>
//   <SimpleTag>에디터 커스텀</SimpleTag>
//   <SimpleTag>회차 내보내기</SimpleTag>
//   <SimpleTag>플롯 에디터</SimpleTag>
//   <SimpleTag>AI 리뷰</SimpleTag>
//   <SimpleTag>버전 관리</SimpleTag>
//   <SimpleTag>기호 자동 대치</SimpleTag>
//   <SimpleTag>소설 공유</SimpleTag>
// </Wrap>
// <Text
//   fontSize={"sm"}
//   color={{ base: "gray.500", _dark: "gray.400" }}
//   lineHeight={1.5}
// >
//   ...등등 이거 외에도 많은 기능이 있고, 피드백을 받아 계속
//   추가되고 있어요!
// </Text>
// </Stack>

const FunctionCard: React.FC<{
  icon?: React.ReactNode
  children?: React.ReactNode
  description?: string
}> = ({ icon, children, description }) => {
  return (
    <Stack rounded={8} w={"100%"} p={5} borderWidth={1}>
      {!!icon && (
        <Icon mb={3} fontSize={"5xl"} color={"purple.500"}>
          {icon}
        </Icon>
      )}
      <Heading>{children}</Heading>
      <Text
        fontSize={"sm"}
        color={{ base: "gray.500", _dark: "gray.400" }}
        lineHeight={1.5}
      >
        {description}
      </Text>
    </Stack>
  )
}

const InfoTemplate: React.FC<{
  userCount: number
}> = ({ userCount }) => {
  const user = useUser()
  const login = useLogin()

  return (
    <VStack p={0} w={"100%"} pb={"50px"}>
      <Header logo={false} />
      <Center
        w={"100%"}
        h={"80vh"}
        minH={"xl"}
        bgGradient="to-tr"
        gradientFrom={{ base: "#f1e4e4", _dark: "#10121c" }}
        gradientTo={{ base: "#cfb1e7", _dark: "#7a66b6" }}
        px={5}
      >
        <Stack w={"100%"} maxW={"4xl"}>
          <HStack mb={2}>
            <Logo w={{ base: "120px", md: "160px" }} />
            <Tag.Root ml={2}>
              <Tag.Label>v{import.meta.env.VITE_APP_VERSION}</Tag.Label>
            </Tag.Root>
          </HStack>
          <Heading
            as={"h1"}
            fontSize={{ base: "3xl", md: "5xl" }}
            lineHeight={1.4}
            fontWeight={800}
          >
            <Mark variant={"solid"} colorPalette={"purple"}>
              뮤블
            </Mark>
            , 웹소설 작가를 위한
            <br />
            최고의 크로스플랫폼{" "}
            <Mark variant={"solid"} colorPalette={"purple"}>
              소설 편집기
            </Mark>
          </Heading>
          <Text color={{ base: "gray.500", _dark: "gray.200" }}>
            내 연재가 30편을 못 넘겼던 건 사실 도구 때문이었던 거야!
          </Text>
          <HStack mt={"30px"} gap={3} flexWrap={"wrap"}>
            {user ? (
              <BlockLink to={"/"}>
                <Button>
                  <TbArrowRight />
                  무료로 바로 쓰러가기
                </Button>
              </BlockLink>
            ) : (
              <Button onClick={login}>
                <TbArrowRight />
                로그인하고 글 쓰러 가기
              </Button>
            )}
            <Menu.Root>
              <Menu.Trigger asChild>
                <Tooltip
                  content={
                    "프로그램 완성은 했는데 정작 다운로드 링크랑 배포 세팅을 못했네요 이런"
                  }
                  openDelay={100}
                >
                  <Button disabled>
                    <TbDownload />
                    뮤블 데스크톱 다운받기
                    <Tag.Root ml={1}>
                      <Tag.Label>BETA</Tag.Label>
                    </Tag.Root>
                  </Button>
                </Tooltip>
              </Menu.Trigger>
              <Menu.Positioner>
                <Menu.Content>
                  <Menu.ItemGroup>
                    <Menu.Item value={"windows"}>
                      <TbBrandWindows /> Windows
                      <Spacer />
                      <Text fontSize={"xs"} color={"gray.500"}>
                        Windows 7 이상
                      </Text>
                    </Menu.Item>
                    <Menu.Item value={"macos"}>
                      <TbBrandApple /> MacOS
                      <Spacer />
                      <Text fontSize={"xs"} color={"gray.500"}>
                        10.15 Catalina 이상
                      </Text>
                    </Menu.Item>
                    <Menu.Item value={"linux"}>
                      <SiLinux /> Linux
                    </Menu.Item>
                  </Menu.ItemGroup>
                  <Menu.Separator />
                  <Menu.ItemGroup>
                    <Menu.Item value={"android"}>
                      <TbBrandGooglePlay /> Android
                      <Spacer />
                      <Text fontSize={"xs"} color={"gray.500"}>
                        Android 8 이상
                      </Text>
                    </Menu.Item>
                    <Menu.Item value={"ios"}>
                      <SiIos /> iOS
                      <Spacer />
                      <Text fontSize={"xs"} color={"gray.500"}>
                        iOS 9 이상
                      </Text>
                    </Menu.Item>
                  </Menu.ItemGroup>
                </Menu.Content>
              </Menu.Positioner>
            </Menu.Root>
            <Tooltip
              content={"뮤블은 여러분의 후원으로 운영됩니다!"}
              openDelay={100}
            >
              <BlockLink to={"https://www.buymeacoffee.com/kimustory"}>
                <Button colorPalette={"purple"}>
                  <SiBuymeacoffee /> 뮤블 후원하기!
                </Button>
              </BlockLink>
            </Tooltip>
          </HStack>
        </Stack>
      </Center>

      <VStack mt={"100px"} w={"100%"} maxW={"4xl"} px={5} mb={"100px"}>
        <Heading fontSize={"3xl"} fontWeight={700} as={"h2"}>
          <Text as={"span"} color={"purple.500"}>
            뮤블
          </Text>
          이 대체{" "}
          <Mark variant={"solid"} colorPalette={"purple"}>
            뭔가요?
          </Mark>
        </Heading>
        <Text textAlign={"center"} lineHeight={1.7} mt={3}>
          <b>뮤블(Muvel)</b>은 웹소설 작가님들을 위해{" "}
          <Link href={"https://kimustory.net"} colorPalette={"purple"}>
            키뮤스토리
          </Link>
          에서 개발한 <b>소설 편집기</b>로, 현재{" "}
          <Mark variant={"solid"} colorPalette={"purple"}>
            {userCount.toLocaleString()}명의 작가
          </Mark>
          님이 뮤블을 사용하고 있어요!
          <br />
          불필요한 기능이 많고 무거운 일반 워드프로세서에 비해, 웹소설 작성에
          특화된 여러 기능을 가지고 있어요!
        </Text>

        <Image mt={3} w={"100%"} src={"/screenshot.webp"} />
        <Heading fontSize={"3xl"} fontWeight={700} as={"h2"} mt={"100px"}>
          <Text as={"span"} color={"purple.500"}>
            뮤블
          </Text>
          에는{" "}
          <Mark variant={"solid"} colorPalette={"purple"}>
            어떤 특징이
          </Mark>{" "}
          있나요?
        </Heading>
        <Text textAlign={"center"} lineHeight={1.7} mt={3}>
          뮤블에는 웹소설 작가님들을 위한 다양하고 특별한 기능들이 있어요!
        </Text>
        <SimpleGrid mt={5} w={"100%"} gap={2} minChildWidth={"220px"}>
          <FunctionCard
            icon={<FaPenFancy />}
            description={
              "뮤블은 웹소설 집필에 특화된 에디터로, 작가들에게 필요한 기능 위주로 탑재되어 다른 워드프로세서보다 가벼워요! '읽는 사람'과 '쓰는 사람'이 같은 화면을 보게 하자라는 철학 하에 개발되었어요!"
            }
          >
            웹소설 편집 특화
          </FunctionCard>
          {/*<FunctionCard*/}
          {/*  icon={<MdDevices />}*/}
          {/*  description={*/}
          {/*    "뮤블은 크로스플랫폼 에디터예요! PC, 모바일, 웹에서 모두 동일하게 사용 가능해요! 웹 버전은 브라우저가 있는 거의 모든 기기, 설치 버전은 Windows, MacOS, Linux, Android에서 똑같이 사용 가능해요!"*/}
          {/*  }*/}
          {/*>*/}
          {/*  크로스플랫폼 에디터*/}
          {/*</FunctionCard>*/}
          <FunctionCard
            description={
              "뮤블은 무료인 대신 여러분의 후원으로 운영되고 있어요. 만약 후원하지 않아도 누구나 무료로 사용 가능해요! 설치 버전은 계정 없이도 사용 가능하니까, 평생 무료로 사용하실 수 있어요!"
            }
            icon={<MdMoneyOff />}
          >
            무료로 사용하세요!
          </FunctionCard>
          <FunctionCard
            icon={<MdWifi />}
            description={
              "뮤블에서 만든 소설은 실시간 클라우드 연동이 되어 인터넷만 된다면 어떤 기기든 계정으로 연동해 집필할 수 있어요! 더 이상 소설을 이리저리 옮길 필요가 없겠죠?"
            }
          >
            실시간 클라우드 연동
          </FunctionCard>
          <FunctionCard
            description={
              "'위젯'은 뮤블만의 시스템으로, 필요한 기능만을 작업 환경에 배치할 수 있는 기능이에요! '글자 수 위젯', '스톱워치 위젯', '사전 위젯', '회차 참조 위젯' 등 다양한 위젯을 제공해요!"
            }
            icon={<MdOutlineWidgets />}
          >
            뮤블 에디터 위젯
          </FunctionCard>
          <FunctionCard
            description={
              "편집기의 글꼴, 배경 색상, 색상 등 여러가지 요소를 커스터마이징 할 수 있어요! 위젯 기능과 합쳐 나만의 편집기를 만들어보세요!"
            }
            icon={<IoColorPalette />}
          >
            에디터 스타일 커스텀
          </FunctionCard>
          <FunctionCard
            description={
              "글을 길게 써도 항상 편집하는 부분이 자동으로 화면의 중앙에 오게 하는 기능이에요! 물론 옵션에서 비활성화할 수 있어요."
            }
            icon={<MdOutlineVerticalAlignCenter />}
          >
            타입라이터 스크롤
          </FunctionCard>
          <FunctionCard
            description={
              "빈 캔버스에 노드를 놓고 자유롭게 연결할 수 있는 '플롯 에디터'를 제공해요! 메모, 사건 정리, 인물 관계도 등 다양한 용도로 사용 가능해요!"
            }
            icon={<GoWorkflow />}
          >
            플롯 에디터
          </FunctionCard>
          {/*<FunctionCard*/}
          {/*  description={*/}
          {/*    "혹시 보안이나 안정성이 중요하거나, 오프라인 환경에 주로 계셔도 걱정 마세요! 데스크톱 버전에서 클라우드 연동을 포기하는 대신, 로컬에만 소설을 생성할 수도 있어요!"*/}
          {/*  }*/}
          {/*  icon={<MdWifiOff />}*/}
          {/*>*/}
          {/*  로컬에만도 저장 가능!*/}
          {/*</FunctionCard>*/}
          <FunctionCard
            description={
              "소설 쓸 때 제일 많이 쓰는 건 따옴표죠! 뮤블은 따옴표 입력 시 자동으로 쌍이 생기고, 이후 닫는 따옴표 직전에서 줄바꿈을 하면 바로 다음 줄로 넘어가는 '빠른 따옴표' 기능을 제공해요!"
            }
            icon={<BsQuote />}
          >
            빠른 따옴표 입력
          </FunctionCard>
          <FunctionCard
            description={
              "소설을 '공개' 또는 '일부 공개'로 설정하면 링크만으로 소설을 다른 사람과 공유할 수 있어요! 이제 쓰고 있던 소설을 손쉽게 다른 사람에게 감평받을 수 있어요!"
            }
            icon={<TbShare />}
          >
            간단한 공유
          </FunctionCard>
          <FunctionCard
            description={
              "뮤블은 페이지 어디서든 우측 위 버튼을 통해 간단히 '다크 모드'와 '라이트 모드'를 전환할 수 있어요! 글쓰면서 피로하지 않은 환경을 만들어보세요!"
            }
            icon={<MdDarkMode />}
          >
            라이트 · 다크 모드
          </FunctionCard>
          <FunctionCard
            description={
              "집필한 회차를 AI가 리뷰하거나 줄거리를 요약해줄 수 있어요! 이 기능은 여러분이 요청했을 때만 이뤄지고, 분석을 요청하더라도 AI는 여러분의 컨텐츠를 학습하지 않아요!"
            }
            icon={<IoSparklesSharp />}
          >
            AI 리뷰 · 요약
          </FunctionCard>
          <FunctionCard
            description={
              "(웹 버전 한정) 10분마다 자동으로 소설의 현재 버전을 저장해줘요! 혹시나 잘못 수정한 것 같아도 걱정 마세요!"
            }
            icon={<TbHistory />}
          >
            자동 버전 관리
          </FunctionCard>
        </SimpleGrid>
        <Heading fontSize={"3xl"} fontWeight={700} as={"h2"} mt={"100px"}>
          <Text as={"span"} color={"purple.500"}>
            뮤블
          </Text>
          은 왜{" "}
          <Mark variant={"solid"} colorPalette={"purple"}>
            무료인가요?
          </Mark>
        </Heading>
        <Text textAlign={"center"} lineHeight={1.7} mt={3}>
          뮤블은 초기 개발 과정에서 그 어떠한 투자나 후원도 없이 만들어졌어요.
          물론 작정하면 큰 돈을 투자받을 수도 있었겠지만, 그렇게 하면 제가
          만드는 건 본질적으로 '글을 쓰기 위한 도구'가 아니라 '돈을 벌기 위한
          도구'가 될 것 같았거든요. (제가 좀 괴짜죠?)
        </Text>
        <Text textAlign={"center"} lineHeight={1.7}>
          저같이 돈이 없어서 비싼 편집기를 못 쓰는 작가 분들도 마음껏 이야기를
          쓸 수 있게, 뮤블은 소규모 후원 방식으로 운영하고 있어요.
        </Text>
        <Text textAlign={"center"} lineHeight={1.7}>
          유료화 예정도 애초에 없지만, 유료화 되더라도 오프라인 버전 프로그램이
          이미 무료로 배포되었으니 서비스 종료 걱정 없이 평생 사용하실 수 있을
          거예요. 대신 뮤블로 이야기를 써서 성공한다면 돌아와 커피 한 잔
          값이라도 주셨으면 좋겠는 게 제 바람이에요.
        </Text>
        <Text textAlign={"center"} lineHeight={1.7}>
          우리가 태어나면서 가지고 있는 것은 다를지라도, 삶을 살며 써가는
          '이야기' 만큼은 모두의 삶에 평등했으면 좋겠네요.
        </Text>
        <Text textAlign={"center"} lineHeight={1.7} color={"gray.500"} mt={3}>
          — 뮤블 개발자, 키뮤
        </Text>
      </VStack>

      <Footer />
    </VStack>
  )
}

export default InfoTemplate
