export interface WikiPage {
  id: string
  title: string
  summary: string | null
  category: WikiPageCategory | null
  tags: string[]
  thumbnail: string | null
  attributes: Record<string, string>

  createdAt: string
  updatedAt: string
}

export enum WikiPageCategory {
  Character = "character",
  Location = "location",
  Item = "item",
  Organization = "organization",
  Event = "event",
}
