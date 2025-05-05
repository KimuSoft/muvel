import { motion } from "motion/react"
import {
  Box,
  Center,
  HStack,
  SimpleGrid,
  Stack,
  VStack,
} from "@chakra-ui/react"

export const MotionBox = motion.create(Box)
export const MotionStack = motion.create(Stack)
export const MotionHStack = motion.create(HStack)
export const MotionVStack = motion.create(VStack)
export const MotionCenter = motion.create(Center)
export const MotionSimpleGrid = motion.create(SimpleGrid)
