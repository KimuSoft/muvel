// 하위 데이터는 통째로 취급하지만, 상위 데이터는 id만 취급한다. (실제로 그 값이 있을지라도)
// User > Novel > Episode > Block 개념
export interface PartialData {
  id: string
}

export const defaultOption: EditorOption = {
  lineHeight: 34,
  fontSize: 19,
  gap: 8,
  indent: 1,
}

export interface EditorOption {
  lineHeight: number
  fontSize: number
  gap: number
  indent: number
}
