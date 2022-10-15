// https://github.com/KimuSoft/mu-dictionary

export interface Word {
  word: string // 어휘 (필수 항목)
  wordUnit: WordUnit // 구성 단위 (필수 항목)
  wordType?: WordType // 고유어 여부
  originDetail?: string // 원어·어종
  originalLanguage?: string // 원어
  origin?: string // 어원
  pronunciation?: string // 발음
  conjugation?: string // 활용
  allomorph?: string // 검색용 이형태
  pos: Pos // 품사 (필수 항목)
  senseNumber: number // 의미 번호 (필수 항목)
  definition: string // 뜻풀이 (필수 항목)
  region?: string // 방언 지역
  pattern?: string // 문형
  grammar?: string // 문법
  wordGroup?: WordGroup // 범주
  example?: string // 용례
  category?: string // 전문 분야
  relation?: string // 관련 어휘
  proverb?: string // 속담
  idiom?: string // 관용구
  translation?: string // 대역어
  biologicalClassification?: string // 생물 분류군 정보
  history?: string // 역사 정보
  signLanguage?: string // 수어 정보
  norm?: string // 규범 정보
  multimedia?: string // 다중 매체(멀티미디어) 정보
}

export enum WordUnit {
  Word,
  Phrase,
  Idiom,
  Proverb,
}

// 고유어 여부
export enum WordType {
  Native, // 고유어
  Chinese, // 한자
  Loanword, // 외래어
  Hybrid, // 혼종어
  Unknown, // 알 수 없음
}

// 품사
export enum Pos {
  Noun, // 명사
  Pronoun, // 대명사
  Numeral, // 수사
  Postposition, // 조사
  Verb, // 동사
  Adjective, // 형용사
  Determiner, // 관형사
  Adverb, // 부사
  Interjection, // 감탄사
  Affix, // 접사
  DependentNoun, // 의존 명사
  AuxiliaryVerb, // 보조 동사
  AuxiliaryAdjective, // 보조 형용사
  Ending, // 어미
  DeterminerNoun, // 관형사·명사
  NumeralDeterminer, // 수사·관형사
  NounAdverb, // 명사·부사
  InterjectionNoun, // 감탄사·명사
  PronounAdverb, // 대명사·부사
  PronounInterjection, // 대명사·감탄사
  VerbAdjective, // 동사·형용사
  DeterminerInterjection, // 관형사·감탄사
  AdverbInterjection, // 부사·감탄사
  DependentNounPostposition, // 의존명사·조사
  NumeralDeterminerNoun, // 수사·관형사·명사
  PronounDeterminer, // 대명사·관형사
  None, // 품사 없음
}

// 범주
export enum WordGroup {
  General, // 표준어
  Dialect, // 지역어 (방언)
  NKorean, // 북한어
  Ancient, // 옛말
}

// 전문 분야
export enum Category {
  None = "없음",
}
