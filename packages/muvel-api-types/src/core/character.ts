export interface Character {
  id: string
  name: string
  avatar: string | null
  tags: string[]
  summary: string | null
  galleries: string[]
  importance: CharacterImportance
  attributes: Record<string, string>
}

export enum CharacterImportance {
  Main = 0, // 주인공
  Major = 1, // 주연
  Supporting = 2, // 조연
  Minor = 3, // 단역
  Cameo = 4, // 까메오
}
