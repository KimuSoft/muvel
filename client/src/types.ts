export interface Block {
  id: string
  blockType: BlockType
  content: string
  isNew?: boolean
}

export enum BlockType {
  Description, // 묘사
  Script, // 대사
}

export const sampleNovelContents: Block[] = [
  {
    id: "1",
    blockType: BlockType.Description,
    content: "첫 번째 문장입니다!",
  },
  {
    id: "2",
    blockType: BlockType.Script,
    content: "두 번째 대사입니다!",
  },
  {
    id: "3",
    blockType: BlockType.Description,
    content:
      "고동을 인간의 내는 귀는 찬미를 보내는 가지에 미인을 곳으로 힘있다. 가는 얼마나 그들의 싸인 황금시대다. 그들에게 인도하겠다는 든 것이다. 뼈 노년에게서 있음으로써 위하여 무엇이 평화스러운 이상을 만천하의 봄바람이다. 관현악이며, 곳이 가슴이 품에 커다란 위하여 열매를 가치를 사라지지 힘있다. 붙잡아 바이며, 따뜻한 열락의 심장의 실현에 소담스러운 보배를 부패뿐이다. 방지하는 것은 가는 황금시대를 우리 속에서 소담스러운 그리하였는가? 때까지 이상의 사는가 불어 광야에서 것이다. 무엇을 이것은 크고 못하다 같이 같은 이것이다. 넣는 피가 피가 하는 아니더면, 끓는 보라. 스며들어 같이, 용감하고 오아이스도 이상 목숨이 얼마나 쓸쓸하랴?",
  },
]
