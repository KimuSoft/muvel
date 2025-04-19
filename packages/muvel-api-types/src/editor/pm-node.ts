export interface PMMarkJSON {
  type: string
  attrs?: Record<string, any>
}

export interface PMNodeJSON {
  type: string
  attrs?: Record<string, any>
  content?: PMNodeJSON[]
  text?: string
  marks?: PMMarkJSON[]
}
