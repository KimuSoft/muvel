import React from "react"
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
  useDisclosure,
} from "@chakra-ui/react"
import useCurrentUser from "../../hooks/useCurrentUser"
import { useNavigate } from "react-router-dom"
import { api } from "../../utils/api"
import { Novel } from "../../types/novel.type"
import { toast } from "react-toastify"
import { AiFillFileAdd } from "react-icons/ai"
import { Field, Form, Formik } from "formik"

const CreateNovel: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const user = useCurrentUser()

  const initialRef = React.useRef(null)
  const navigate = useNavigate()

  const onSubmit = async () => {
    console.log("새소설 !!!")
    const { data } = await api.post<Novel>(`/users/${user?.id}/novels`, {
      title: "새 소설",
      description: "설명",
    })
    navigate(`/novels/${data.id}`)
  }

  const _onOpen = () => {
    if (!user) return toast.warn("소설을 쓰려면 로그인을 먼저 해 주세요!")
    onOpen()
  }

  const validateTitle = (value: string) => {
    console.log(value)
    let error
    if (!value) {
      error = "제목을 입력해 주세요."
    }
    return error
  }

  return (
    <>
      <Button gap={3} colorScheme="purple" onClick={onOpen}>
        <AiFillFileAdd /> 소설 추가하기
      </Button>

      <Modal initialFocusRef={initialRef} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <Formik
          initialValues={{ title: "새 소설", description: "" }}
          onSubmit={console.log}
        >
          {(props) => (
            <ModalContent>
              <ModalHeader>새 소설 작성하기</ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6}>
                <Form>
                  <Field name="title" validate={validateTitle}>
                    {({ field, form }) => (
                      <FormControl
                        isInvalid={form.errors.name && form.touched.name}
                      >
                        {console.log(field)}
                        <FormLabel>제목</FormLabel>
                        <Input
                          {...field}
                          ref={initialRef}
                          placeholder="소설의 제목을 지어주세요."
                        />
                        <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>

                  <FormControl mt={4}>
                    <FormLabel>설명</FormLabel>
                    <Textarea placeholder="소설의 설명을 입력해 주세요" />
                  </FormControl>
                </Form>
              </ModalBody>

              <ModalFooter>
                <Button onClick={onClose} mr={3}>
                  취소
                </Button>
                <Button
                  colorScheme="blue"
                  type="submit"
                  isLoading={props.isSubmitting}
                >
                  생성하기
                </Button>
              </ModalFooter>
            </ModalContent>
          )}
        </Formik>
      </Modal>
    </>
  )
}

export default CreateNovel
