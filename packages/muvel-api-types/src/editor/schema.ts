export type QuoteStyle =
  | "double"
  | "single"
  | "scythe-single"
  | "scythe-double"
  | "guillemet-single"
  | "guillemet-double"

export interface BlockAttrs {
  id?: string
  characterId?: string
  quoteStyle?: QuoteStyle
  emotion?: string
  emphasis?: boolean
}
