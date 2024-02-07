import React, { useState } from "react"
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  Stepper,
  StepSeparator,
  StepStatus,
  StepTitle,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Textarea,
} from "@chakra-ui/react"
import useCurrentUser from "../../../hooks/useCurrentUser"
import { useNavigate } from "react-router-dom"
import { api } from "../../../utils/api"
import { Novel, ShareType } from "../../../types/novel.type"
import { AiFillLock, AiOutlineLink } from "react-icons/ai"
import { Field, FieldProps, Form, Formik } from "formik"
import RadioCardGroup from "../../molecules/RadioCardGroup"
import { MdPublic } from "react-icons/md"
import { TbArrowLeft, TbArrowRight, TbCheck } from "react-icons/tb"
import { RiQuillPenFill } from "react-icons/ri"

const steps = [
  { title: "제목 짓기", description: "소설 제목 짓기" },
  { title: "공개 범위", description: "볼 수 있는 사람은?" },
]

const CreateNovelModal: React.FC<
  {
    novel?: Novel
    onModify?: () => Promise<unknown>
  } & Omit<ModalProps, "children">
> = ({ novel, onModify, ...props }) => {
  const user = useCurrentUser()

  const initialRef = React.useRef(null)
  const navigate = useNavigate()

  const [stepIndex, setStepIndex] = useState(0)
  const [isError, setIsError] = useState(false)

  const validateTitle = (value: string) => {
    let error
    if (!value) {
      error = "제목을 입력해 주세요."
    }
    return error
  }

  const onSubmit = async (values: {
    title: string
    share: string | number
  }) => {
    values = {
      ...values,
      share: parseInt(values.share.toString()),
    }

    // Create Novel
    const { data } = await api.post<Novel>(`/users/${user?.id}/novels`, values)
    navigate(`/novels/${data.id}`)
  }

  return (
    <Modal
      initialFocusRef={initialRef}
      isOpen={props.isOpen}
      onClose={props.onClose}
    >
      <ModalOverlay />
      <ModalContent>
        <Formik
          initialValues={{
            title: "",
            description: "",
            share: ShareType.Private.toString(),
            thumbnail: "",
          }}
          onSubmit={onSubmit}
        >
          {(formProps) => (
            <Form>
              <ModalHeader
                display={"flex"}
                flexDir={"row"}
                alignItems={"center"}
                gap={3}
              >
                <RiQuillPenFill />새 소설 만들기
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6}>
                <Tabs index={stepIndex} h={"150px"}>
                  <TabPanels>
                    <TabPanel px={0}>
                      <Field name="title" validate={validateTitle}>
                        {({ field, form }: FieldProps) => (
                          <FormControl
                            isInvalid={
                              !!(form.errors.title && form.touched.title)
                            }
                          >
                            <FormLabel>
                              소설의 제목은 무엇으로 하실 건가요?
                            </FormLabel>
                            <Input
                              {...field}
                              onChange={(e) => {
                                field.onChange(e)
                                console.log(!validateTitle(e.target.value))
                                setIsError(!validateTitle(e.target.value))
                              }}
                              placeholder="소설의 제목을 지어주세요."
                            />
                            <FormErrorMessage>
                              {form.errors.title as string}
                            </FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                    </TabPanel>
                    <TabPanel px={0}>
                      <Field name="share">
                        {({ field, form }: FieldProps) => (
                          <FormControl>
                            <FormLabel>누구한테 볼 수 있게 할까요?</FormLabel>
                            <RadioCardGroup
                              onChange={(value) => {
                                form.setFieldValue("share", value).then()
                              }}
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
                    </TabPanel>
                  </TabPanels>
                </Tabs>

                <Stepper index={stepIndex} colorScheme={"purple"}>
                  {steps.map((step, index) => (
                    <Step key={index}>
                      <StepIndicator>
                        <StepStatus
                          complete={<StepIcon />}
                          incomplete={<StepNumber />}
                          active={<StepNumber />}
                        />
                      </StepIndicator>

                      {index === stepIndex ? (
                        <Box flexShrink="0">
                          <StepTitle>{step.title}</StepTitle>
                          <StepDescription>{step.description}</StepDescription>
                        </Box>
                      ) : null}

                      <StepSeparator />
                    </Step>
                  ))}
                </Stepper>
              </ModalBody>

              <ModalFooter gap={2}>
                <Button
                  leftIcon={stepIndex ? <TbArrowLeft /> : undefined}
                  onClick={() => {
                    if (!stepIndex) return props.onClose()
                    setStepIndex(stepIndex - 1)
                  }}
                >
                  {stepIndex ? "이전" : "취소"}
                </Button>
                {stepIndex !== steps.length - 1 ? (
                  <Button
                    key={"next-button"}
                    colorScheme="purple"
                    rightIcon={<TbArrowRight />}
                    disabled={!formProps.values.title}
                    onClick={() => setStepIndex(stepIndex + 1)}
                  >
                    다음
                  </Button>
                ) : (
                  <Button
                    key={"submit-button"}
                    colorScheme="blue"
                    disabled={!formProps.values.title}
                    isLoading={formProps.isSubmitting}
                    type="submit"
                    leftIcon={<TbCheck />}
                  >
                    만들기
                  </Button>
                )}
              </ModalFooter>
            </Form>
          )}
        </Formik>
      </ModalContent>
    </Modal>
  )
}

export default CreateNovelModal
