import React, { useEffect, useMemo, useState } from "react"
import {
  Button,
  Container,
  Divider,
  Heading,
  Hide,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  SimpleGrid,
  Spacer,
  Text,
  useColorModeValue,
  useDisclosure,
  useMediaQuery,
  VStack,
} from "@chakra-ui/react"
import { RiQuillPenFill } from "react-icons/ri"
import Header from "../organisms/Header"
import { BiSearch } from "react-icons/bi"
import NovelItem from "../organisms/main/NovelItem"
import { Novel } from "../../types/novel.type"
import { User } from "../../types/user.type"
import NovelItemSkeleton from "../organisms/main/NovelItemSkeleton"
import CreateNovelModal from "../organisms/forms/CreateNovelModal"
import { FaBookBookmark } from "react-icons/fa6"
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable"
import SortableNovelItem from "../organisms/main/SortableNovelItem"

const MyNovelTemplate: React.FC<{
  user: User
  novels: Novel[]
  isLoading: boolean
}> = ({ user, novels, isLoading }) => {
  const [innerWidth, setInnerWidth] = useState(window.innerWidth)
  const [isPC] = useMediaQuery("(min-width: 800px)")

  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    const resizeListener = () => {
      setInnerWidth(window.innerWidth)
    }
    window.addEventListener("resize", resizeListener)
  })

  const column = useMemo(() => {
    if (innerWidth > 1350) return 3
    if (innerWidth > 1000) return 2
    return 1
  }, [innerWidth])

  const loginClickHandler = () => {
    window.location.href = import.meta.env.VITE_API_BASE + "/auth/login"
  }

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 50,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 1,
      },
    })
  )

  return (
    <VStack w={"100vw"}>
      <Header />
      <Container w={isPC ? "80%" : "100%"} maxW={"1200px"} my={100} px={3}>
        <HStack w={"100%"} gap={3} mb={3} px={3}>
          <FaBookBookmark size={18} />
          <Heading fontSize={"xl"}>{user.username}의 소설 목록</Heading>
          <Text fontSize={"md"} color={"gray.500"}>
            ({novels.length}개)
          </Text>
          <Spacer />
          <Button
            gap={2.5}
            size={"sm"}
            colorScheme="purple"
            onClick={onOpen}
            flexShrink={0}
            variant={"outline"}
          >
            <RiQuillPenFill />
            {isPC && "새 소설 쓰기"}
          </Button>
          <CreateNovelModal isOpen={isOpen} onClose={onClose} />
        </HStack>
        <Divider mb={5} />
        {!isLoading ? (
          novels.length ? (
            <DndContext
              sensors={sensors}
              onDragStart={() => {
                console.log("drag start")
              }}
              onDragEnd={() => {
                console.log("drag end")
              }}
            >
              <SortableContext items={novels} strategy={rectSortingStrategy}>
                <SimpleGrid
                  w={"100%"}
                  columns={column}
                  gridColumnGap={4}
                  gridRowGap={0}
                >
                  {novels.map((novel) => (
                    <SortableNovelItem novel={novel} key={novel.id} />
                  ))}
                </SimpleGrid>
              </SortableContext>
            </DndContext>
          ) : user ? (
            <Text color={"gray.500"} textAlign={"center"}>
              소설이 없네요...
              <br />
              오른쪽 위의 깃펜 모양의 버튼을 눌러 새 소설을 써 보세요!
            </Text>
          ) : (
            <Text color={"gray.500"} textAlign={"center"}>
              소설이 없네요...
              <br />
              뮤블에{" "}
              <Link
                fontWeight={"800"}
                color={"purple.500"}
                onClick={loginClickHandler}
              >
                로그인
              </Link>
              해서 저랑 같이 새 소설을 써 보아요!
            </Text>
          )
        ) : (
          <SimpleGrid w={"100%"} columns={column} gap={2}>
            <NovelItemSkeleton />
            <NovelItemSkeleton />
            <NovelItemSkeleton />
            <NovelItemSkeleton />
            <NovelItemSkeleton />
            <NovelItemSkeleton />
          </SimpleGrid>
        )}
      </Container>
    </VStack>
  )
}

export default MyNovelTemplate
