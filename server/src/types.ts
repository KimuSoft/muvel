import mongoose, { Model } from "mongoose"

export interface IWord {
  name: string
  wordClass: WordClass
  origin?: string
  pronunciation?: string
  definition: string
  tags: string[]
  reference: string
}

export interface IWordMethods {}

export type WordModel = Model<IWord, {}, IWordMethods>
export type UserDoc = mongoose.Document<{}, {}, IWord> & {
  _id: mongoose.Types.ObjectId
} & IWord &
  IWordMethods

// 품사
export enum WordClass {
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
  Phrase = 30, // 구
  Idiom, // 관용구
  Proverb, // 속담
}
