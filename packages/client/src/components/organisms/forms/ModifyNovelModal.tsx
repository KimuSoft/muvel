import React from "react"
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
  Spacer,
  Text,
  Textarea,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react"
import { api } from "../../../utils/api"
import { Novel, ShareType } from "../../../types/novel.type"
import { AiFillLock, AiOutlineLink } from "react-icons/ai"
import { Field, FieldProps, Form, Formik } from "formik"
import RadioCardGroup from "../../molecules/RadioCardGroup"
import { MdPublic } from "react-icons/md"
import DeleteNovelDialog from "./DeleteNovelDialog"
import { TbCheck, TbEdit, TbFileExport, TbTrash } from "react-icons/tb"

const ModifyNovelModal: React.FC<
  {
    novel: Novel
    onModify?: () => Promise<unknown>
  } & Omit<ModalProps, "children">
> = ({ novel, onModify, ...props }) => {
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: isDeleteClose,
  } = useDisclosure()

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

    // Update Novel
    await api.patch<Novel>(`/novels/${novel.id}`, values)
    props.onClose()
    onModify?.().then()
  }

  const validateTitle = (value: string) => {
    let error
    if (!value) {
      error = "제목을 입력해 주세요."
    }
    return error
  }

  return (
    <Modal {...props}>
      <ModalOverlay />
      <Formik
        initialValues={{
          title: novel.title || "새 소설",
          description: novel.description || "",
          share: novel.share.toString() || ShareType.Private.toString(),
          thumbnail: novel.thumbnail || "",
        }}
        onSubmit={onSubmit}
      >
        {(formProps) => (
          <Form>
            <ModalContent>
              <ModalHeader
                display={"flex"}
                flexDir={"row"}
                alignItems={"center"}
              >
                <TbEdit size={24} style={{ marginRight: 10 }} />
                소설 수정하기
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
                  {({ field }: FieldProps) => (
                    <FormControl mt={4}>
                      <FormLabel>설명</FormLabel>
                      <Textarea
                        {...field}
                        placeholder="소설의 설명을 입력해 주세요"
                      />
                    </FormControl>
                  )}
                </Field>

                <Field name="share">
                  {({ field, form }: FieldProps) => (
                    <FormControl mt={4}>
                      <FormLabel>공개 범위</FormLabel>
                      <RadioCardGroup
                        onChange={(value) => form.setFieldValue("share", value)}
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
                    </FormControl>
                  )}
                </Field>

                {/* 소설 썸네일 필드 */}
                <Field name="thumbnail">
                  {({ field }: FieldProps) => (
                    <FormControl mt={4}>
                      <FormLabel>소설 썸네일 이미지</FormLabel>
                      <Input
                        {...field}
                        placeholder="소설의 썸네일 이미지 URL을 입력해 주세요."
                      />
                    </FormControl>
                  )}
                </Field>
              </ModalBody>

              <DeleteNovelDialog
                isOpen={isDeleteOpen}
                onClose={isDeleteClose}
                novelId={novel.id}
              />

              <ModalFooter gap={2}>
                <Tooltip label={"소설 삭제하기"}>
                  <IconButton
                    icon={<TbTrash />}
                    aria-label={"delete novel"}
                    onClick={onDeleteOpen}
                    colorScheme="red"
                    variant={"outline"}
                  />
                </Tooltip>

                <Tooltip label={"소설 전체 다운받기"}>
                  <IconButton
                    icon={<TbFileExport />}
                    aria-label={"delete novel"}
                    onClick={async () => {
                      const res = await api.get<Novel>(
                        `/novels/${novel.id}/export`
                      )

                      const data = JSON.stringify(res.data, null, 2)
                      const blob = new Blob([data], {
                        type: "application/json",
                      })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement("a")
                      a.href = url
                      a.download = `${novel.title}.json`
                      a.click()
                    }}
                    colorScheme="blue"
                    variant={"outline"}
                  />
                </Tooltip>

                <Spacer />
                <Button onClick={props.onClose}>취소</Button>
                <Button
                  colorScheme="blue"
                  type="submit"
                  leftIcon={<TbCheck />}
                  isLoading={formProps.isSubmitting}
                >
                  수정하기
                </Button>
              </ModalFooter>
            </ModalContent>
          </Form>
        )}
      </Formik>
    </Modal>
  )
}

export default ModifyNovelModal
