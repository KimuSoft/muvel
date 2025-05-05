import {
  Box,
  Heading,
  HStack,
  List,
  Separator,
  Table,
  Text,
  VStack,
} from "@chakra-ui/react"
import Header from "~/components/organisms/Header"
import React from "react"
import { MdPrivacyTip } from "react-icons/md"

const PrivacyPolicyTemplate = () => {
  return (
    <VStack>
      <Header />
      <Box p={8} mt={20} maxW="800px" mx="auto">
        <HStack>
          <MdPrivacyTip size={24} />
          <Heading as="h1" size="xl" ml={2}>
            개인정보처리방침
          </Heading>
        </HStack>
        <Separator mt={3} mb={5} />

        <Text mb={4}>
          <b>Muvel</b>(이하 "당사")는 「개인정보 보호법」 등 관련 법령에 따라
          이용자의 개인정보를 보호하고자 다음과 같은 개인정보처리방침을 수립하여
          운영하고 있습니다.
        </Text>

        <Heading as="h2" size="md" mt={8} mb={4}>
          1. 수집하는 개인정보 항목
        </Heading>
        <List.Root gap="3" mb={4} ml={5}>
          <List.Item>
            키뮤스토리 OAuth 로그인: 키뮤스토리 ID, 닉네임, 프로필 이미지 URL
          </List.Item>
          <List.Item>소설 콘텐츠(제목, 본문, 썸네일, 태그 등)</List.Item>
          <List.Item>소설 자동 저장 시 생성되는 임시 데이터</List.Item>
          <List.Item>소설 열람 기록(최근 읽은 작품, 열람 시간 등)</List.Item>
          <List.Item>AI 분석 요청 시 입력한 텍스트</List.Item>
          <List.Item>
            Google Drive 연동 시: 사용자의 Google Drive에 소설 콘텐츠 백업
          </List.Item>
        </List.Root>

        <Heading as="h2" size="md" mt={8} mb={4}>
          2. 개인정보 수집 및 이용 목적
        </Heading>
        <List.Root gap="3" mb={4} ml={5}>
          <List.Item>사용자 인증 및 계정 관리</List.Item>
          <List.Item>소설 작성 및 자동 저장 기능 제공</List.Item>
          <List.Item>최근 열람 작품 표시 등 개인 맞춤형 UI 제공</List.Item>
          <List.Item>사용자 환경 설정 저장</List.Item>
          <List.Item>
            AI 기능 제공(Google Gemini API를 통한 요청 분석)
          </List.Item>
          <List.Item>
            Google Drive 자동 백업 기능 제공 (사용자 명시적 동의 후)
          </List.Item>
          <List.Item>통계 분석 및 서비스 개선</List.Item>
        </List.Root>

        <Heading as="h2" size="md" mt={8} mb={4}>
          3. AI 서비스 이용 시 정보 전달
        </Heading>
        <Text mb={4}>
          Muvel의 일부 기능은 Google Gemini API와 연동되어 제공됩니다. 사용자가
          해당 기능을 이용할 경우, 입력한 소설 내용 일부가 Google Gemini API에
          전송되며, 사전 동의 절차를 통해 이를 안내하고 있습니다.
        </Text>

        <Heading as="h2" size="md" mt={8} mb={4}>
          4. 쿠키 및 로컬 저장소 사용
        </Heading>
        <List.Root gap="3" mb={4} ml={5}>
          <List.Item>웹 버전: 로그인 세션 유지를 위해 쿠키 사용</List.Item>
          <List.Item>
            데스크톱/모바일 버전: 사용자 설정 저장을 위해 localStorage 사용
          </List.Item>
        </List.Root>

        <Heading as="h2" size="md" mt={8} mb={4}>
          5. 개인정보 보유 및 이용기간
        </Heading>
        <List.Root gap="3" mb={4} ml={5}>
          <List.Item>
            키뮤스토리 계정 연결 해제 또는 탈퇴 시 개인정보 파기
          </List.Item>
          <List.Item>작성한 콘텐츠는 삭제 요청 시 또는 탈퇴 시 삭제</List.Item>
          <List.Item>
            자동 저장 및 열람 기록은 일정 기간 후 자동 삭제될 수 있음
          </List.Item>
        </List.Root>

        <Heading as="h2" size="md" mt={8} mb={4}>
          6. 외부 서비스 이용 및 제3자 제공
        </Heading>
        <Table.Root variant="outline" mb={4}>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>외부 서비스</Table.ColumnHeader>
              <Table.ColumnHeader>목적</Table.ColumnHeader>
              <Table.ColumnHeader>제공 정보</Table.ColumnHeader>
              <Table.ColumnHeader>사용자 동의</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Google Gemini API</Table.Cell>
              <Table.Cell>AI 분석 기능 제공</Table.Cell>
              <Table.Cell>사용자가 입력한 소설 텍스트</Table.Cell>
              <Table.Cell>기능 사용 시 동의</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Google Drive API</Table.Cell>
              <Table.Cell>사용자 소설 콘텐츠의 자동 백업</Table.Cell>
              <Table.Cell>Google Drive에 전송되는 소설 데이터</Table.Cell>
              <Table.Cell>기능 활성화 시 OAuth 동의</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Oracle Cloud</Table.Cell>
              <Table.Cell>서비스 호스팅</Table.Cell>
              <Table.Cell>없음 (물리적 저장소)</Table.Cell>
              <Table.Cell>-</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Cloudflare</Table.Cell>
              <Table.Cell>DNS 및 보안</Table.Cell>
              <Table.Cell>없음</Table.Cell>
              <Table.Cell>-</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>

        <Heading as="h2" size="md" mt={8} mb={4}>
          7. 이용자의 권리
        </Heading>
        <List.Root gap="3" mb={4} ml={5}>
          <List.Item>개인정보 조회 및 수정</List.Item>
          <List.Item>Muvel 계정 연결 해제</List.Item>
          <List.Item>작성한 콘텐츠의 삭제 요청</List.Item>
        </List.Root>
        <Text mb={4}>
          위 요청은 아래 고객지원 이메일을 통해 접수할 수 있습니다.
        </Text>

        <Heading as="h2" size="md" mt={8} mb={4}>
          8. 개인정보 보호책임자
        </Heading>
        <Text mb={2}>책임자: 키뮤</Text>
        <Text mb={4}>이메일: keleekini@gmail.com</Text>

        <Heading as="h2" size="md" mt={8} mb={4}>
          9. 개정 공지
        </Heading>
        <Text>
          본 방침은 <strong>2025.05.15</strong>부터 적용됩니다. 내용 변경 시
          최소 7일 전 공지를 통해 사전 안내드립니다.
        </Text>
      </Box>
    </VStack>
  )
}

export default PrivacyPolicyTemplate
