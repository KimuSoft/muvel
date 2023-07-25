import { PartialData } from "./index"

export interface Block extends PartialData {
  content: string
  blockType: BlockType
  episodeId?: string
}

export enum BlockType {
  // 감싸는 문장부호가 없는 일반 묘사
  Describe,
  // 큰따옴표(“”)로 감싸진 대사 블록
  DoubleQuote,
  // 작은따옴표(‘’)로 감싸진 독백 블록
  SingleQuote,
  // 홑낫표(「 」)로 감싸진 강조 대사(또는 일본어 대사) 블록
  SingleScythe,
  // 겹낫표(『 』)로 감싸진 강조 대사(또는 일본어 대사) 블록
  DoubleScythe,
  // 홑화살괄호(〈 〉)로 감싸진 강조 대사 블록
  SingleGuillemet,
  // 겹화살괄호(《 》)로 감싸진 강조 대사 블록
  DoubleGuillemet,
  // 출력 시 포함되지 않는 작가용 주석 블록
  Comment,
  Divider,
}

export const sampleBlock: Block = {
  id: "1",
  content: "테스트용 블록입니다.",
  blockType: BlockType.Describe,
  episodeId: "1",
}
