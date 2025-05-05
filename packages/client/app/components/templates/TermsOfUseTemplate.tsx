import {
  Box,
  Heading,
  HStack,
  List,
  Separator,
  Text,
  VStack,
} from "@chakra-ui/react"
import { MdLibraryAddCheck } from "react-icons/md"
import React from "react"
import Header from "~/components/organisms/Header"

const TermsOfUseTemplate = () => {
  return (
    <VStack>
      <Header />
      <Box p={8} mt={20} maxW="800px" mx="auto">
        <HStack>
          <MdLibraryAddCheck size={24} />
          <Heading as="h1" size="xl" ml={2}>
            Muvel 이용약관
          </Heading>
        </HStack>
        <Separator mt={3} mb={5} />

        <Text mb={4}>
          본 약관은 키뮤스토리(이하 "운영자")가 제공하는 창작 지원 서비스
          "Muvel(뮤블)"(이하 "서비스")의 이용조건 및 절차, 권리와 의무,
          책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
        </Text>

        <Heading as="h2" size="md" mt={8} mb={4}>
          1. 이용자 자격 및 약관 효력
        </Heading>
        <List.Root gap="3" mb={4} ml={5}>
          <List.Item>
            본 서비스는 연령 제한 없이 누구나 가입 및 이용이 가능합니다.
          </List.Item>
          <List.Item>
            이용자는 본 약관에 동의함으로써 서비스 이용 권한을 갖습니다.
          </List.Item>
          <List.Item>
            약관 내용은 운영자의 웹사이트를 통해 수시로 공지되며, 변경 시 효력
            발생일로부터 적용됩니다.
          </List.Item>
        </List.Root>

        <Heading as="h2" size="md" mt={8} mb={4}>
          2. 서비스 내용
        </Heading>
        <List.Root gap="3" mb={4} ml={5}>
          <List.Item>
            사용자는 Muvel을 통해 소설, 캐릭터 문서, 플롯 구성 등 창작 활동을
            수행할 수 있습니다.
          </List.Item>
          <List.Item>
            AI 분석 기능, 자동 저장, 열람 기록, Google Drive 백업 등의 기능이
            제공됩니다.
          </List.Item>
          <List.Item>
            모든 콘텐츠는 사용자의 선택에 따라 공개 또는 비공개 설정이
            가능합니다.
          </List.Item>
          <List.Item>
            서비스는 얼리 액세스 상태로 제공되며, 일부 기능은 불안정할 수
            있습니다.
          </List.Item>
        </List.Root>

        <Heading as="h2" size="md" mt={8} mb={4}>
          3. 저작권 및 콘텐츠 관리
        </Heading>
        <List.Root gap="3" mb={4} ml={5}>
          <List.Item>
            이용자가 작성한 모든 콘텐츠(소설, 캐릭터 문서 등)의 저작권은
            전적으로 이용자에게 귀속됩니다.
          </List.Item>
          <List.Item>
            운영자는 해당 콘텐츠에 대한 소유권 또는 사용권을 주장하지 않으며,
            외부 활용도 하지 않습니다.
          </List.Item>
          <List.Item>
            AI 분석 기능을 통해 생성된 결과물의 저작권은 법적 해석에 따라 달라질
            수 있으며, 운영자는 해당 결과물의 귀속에 대해 책임지지 않습니다.
          </List.Item>
        </List.Root>

        <Heading as="h2" size="md" mt={8} mb={4}>
          4. 콘텐츠 제한 및 제재
        </Heading>
        <List.Root gap="3" mb={4} ml={5}>
          <List.Item>
            법령에 위반되는 콘텐츠(음란물, 타인의 저작물을 무단 사용하는 소설
            등)를 공개 설정할 경우, 경고, 콘텐츠 삭제, 계정 정지 등의 조치를
            취할 수 있습니다.
          </List.Item>
          <List.Item>
            비공개 콘텐츠의 경우에도 중대한 위반이 발견될 경우 서비스 이용이
            제한될 수 있습니다.
          </List.Item>
        </List.Root>

        <Heading as="h2" size="md" mt={8} mb={4}>
          5. 책임과 면책
        </Heading>
        <List.Root gap="3" mb={4} ml={5}>
          <List.Item>
            운영자는 개인의 자격으로 서비스를 제공하며, 서비스의 안정적 운영을
            위해 합리적인 노력을 다합니다. 다만, 불가피한 시스템 장애나 외부
            요인에 따른 서비스 중단, 데이터 손실 등에 대해서는 법적 책임을 지지
            않을 수 있습니다.
          </List.Item>
          <List.Item>
            Google Gemini, Google Drive 등 외부 API를 통한 오류나 장애에
            대해서도 책임을 지지 않습니다.
          </List.Item>
          <List.Item>
            서비스에 포함된 후원 링크(예: Buy Me a Coffee)는 이용자의 자율적인
            선택으로, 운영자는 관련 거래에 관여하지 않습니다.
          </List.Item>
        </List.Root>

        <Heading as="h2" size="md" mt={8} mb={4}>
          6. 이용 제한
        </Heading>
        <List.Root gap="3" mb={4} ml={5}>
          <List.Item>
            다음 각호에 해당하는 경우, 사전 통보 없이 계정이 제한되거나 삭제될
            수 있습니다.
          </List.Item>
          <List.Item>
            타인의 정보를 도용하거나 허위 정보를 입력한 경우
          </List.Item>
          <List.Item>스팸, 도배, 악의적 자동화 도구 등을 사용한 경우</List.Item>
          <List.Item>불법 콘텐츠를 생성하거나 공유한 경우</List.Item>
        </List.Root>

        <Heading as="h2" size="md" mt={8} mb={4}>
          7. 기타
        </Heading>
        <List.Root gap="3" mb={4} ml={5}>
          <List.Item>
            본 약관에 명시되지 않은 사항은 대한민국 관계법령 및 상관례에
            따릅니다.
          </List.Item>
          <List.Item>
            본 약관은 대한민국 법률을 준거법으로 하며, 분쟁 발생 시
            서울중앙지방법원을 관할 법원으로 합니다.
          </List.Item>
        </List.Root>
      </Box>
    </VStack>
  )
}

export default TermsOfUseTemplate
