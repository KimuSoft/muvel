import React from "react"
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Hide,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
  useDisclosure,
} from "@chakra-ui/react"
import useCurrentUser from "../../hooks/useCurrentUser"
import { useNavigate } from "react-router-dom"
import { api } from "../../utils/api"
import { Novel, ShareType } from "../../types/novel.type"
import { toast } from "react-toastify"
import {
  AiFillEdit,
  AiFillFileAdd,
  AiFillLock,
  AiOutlineLink,
} from "react-icons/ai"
import { Field, FieldProps, Form, Formik } from "formik"
import RadioCardGroup from "../molecules/RadioCardGroup"
import { MdPublic } from "react-icons/md"
import DeleteNovel from "./DeleteNovel"

const CreateOrUpdateNovel: React.FC<{
  novel?: Novel
  onCreateOrUpdate?: () => Promise<unknown>
}> = ({ novel, onCreateOrUpdate }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const user = useCurrentUser()

  const initialRef = React.useRef(null)
  const navigate = useNavigate()

  const onSubmit = async (values: {
    title: string
    description: string
    share: string | number
    thumbnail: string | null
  }) => {
    values = {
      ...values,
      share: parseInt(values.share.toString()),
      thumbnail: values.thumbnail || null,
    }

    if (novel) {
      // Update Novel
      console.log(values)
      await api.patch<Novel>(`/novels/${novel.id}`, values)
      onClose()
      onCreateOrUpdate?.().then()
    } else {
      // Create Novel
      const { data } = await api.post<Novel>(
        `/users/${user?.id}/novels`,
        values
      )
      navigate(`/novels/${data.id}`)
    }
  }

  const _onOpen = () => {
    if (!user) return toast.warn("소설을 쓰려면 로그인을 먼저 해 주세요!")
    onOpen()
  }

  const validateTitle = (value: string) => {
    let error
    if (!value) {
      error = "제목을 입력해 주세요."
    }
    return error
  }

  return (
    <>
      <Button gap={2.5} colorScheme="purple" onClick={_onOpen} flexShrink={0}>
        {novel ? (
          <>
            <AiFillEdit /> <Hide below={"md"}> 소설 수정하기</Hide>
          </>
        ) : (
          <>
            <AiFillFileAdd /> <Hide below={"md"}> 소설 추가하기</Hide>
          </>
        )}
      </Button>

      <Modal initialFocusRef={initialRef} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <Formik
          initialValues={{
            title: novel?.title || "새 소설",
            description: novel?.description || "",
            share: novel?.share.toString() || ShareType.Private.toString(),
            thumbnail: novel?.thumbnail || "",
          }}
          onSubmit={onSubmit}
        >
          {(props) => (
            <Form>
              <ModalContent>
                <ModalHeader>
                  {novel ? `소설 수정하기` : "새 소설 작성하기"}
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                  {/* 소설 제목 필드 */}
                  <Field name="title" validate={validateTitle}>
                    {({ field, form }: FieldProps) => (
                      <FormControl
                        isInvalid={!!(form.errors.title && form.touched.title)}
                      >
                        <FormLabel>소설 제목</FormLabel>
                        <Input
                          {...field}
                          ref={initialRef}
                          placeholder="소설의 제목을 지어주세요."
                        />
                        <FormErrorMessage>
                          {form.errors.title as string}
                        </FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>

                  {/* 소설 설명 필드 */}
                  <Field name="description">
                    {({ field, form }: FieldProps) => (
                      <FormControl mt={4}>
                        <FormLabel>설명</FormLabel>
                        <Textarea
                          {...field}
                          ref={initialRef}
                          placeholder="소설의 설명을 입력해 주세요"
                        />
                        <FormErrorMessage>
                          {form.errors.title as string}
                        </FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>

                  <Field name="share">
                    {({ field, form }: FieldProps) => (
                      <FormControl mt={4}>
                        <FormLabel>공개 범위</FormLabel>
                        <RadioCardGroup
                          onChange={(value) =>
                            form.setFieldValue("share", value)
                          }
                          defaultValue={field.value}
                          options={[
                            {
                              value: ShareType.Public.toString(),
                              label: (
                                <HStack gap={2}>
                                  <MdPublic />
                                  <Text>공개</Text>
                                </HStack>
                              ),
                            },
                            {
                              value: ShareType.Unlisted.toString(),
                              label: (
                                <HStack gap={2}>
                                  <AiOutlineLink />
                                  <Text>일부 공개</Text>
                                </HStack>
                              ),
                            },
                            {
                              value: ShareType.Private.toString(),
                              label: (
                                <HStack gap={2}>
                                  <AiFillLock />
                                  <Text>비공개</Text>
                                </HStack>
                              ),
                            },
                          ]}
                        />
                        <FormErrorMessage>
                          {form.errors.title as string}
                        </FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>

                  {/* 소설 썸네일 필드 */}
                  <Field name="thumbnail">
                    {({ field, form }: FieldProps) => (
                      <FormControl
                        isInvalid={!!(form.errors.title && form.touched.title)}
                        mt={4}
                      >
                        <FormLabel>소설 썸네일 이미지</FormLabel>
                        <Input
                          {...field}
                          ref={initialRef}
                          placeholder="소설의 썸네일 이미지 URL을 입력해 주세요."
                        />
                        <FormErrorMessage>
                          {form.errors.title as string}
                        </FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                </ModalBody>

                <ModalFooter gap={2}>
                  <Button onClick={onClose}>취소</Button>
                  {novel ? <DeleteNovel novelId={novel.id} /> : null}
                  <Button
                    colorScheme="blue"
                    type="submit"
                    isLoading={props.isSubmitting}
                  >
                    {novel ? "수정하기" : "작성하기"}
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Form>
          )}
        </Formik>
      </Modal>
    </>
  )
}

export default CreateOrUpdateNovel
