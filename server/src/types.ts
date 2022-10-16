import mongoose, { Model } from "mongoose"

// 소설
export interface INovel {
  name: string
  description: string
  episodes: IEpisode[] | mongoose.Types.ObjectId[]
  writer: IUser | mongoose.Types.ObjectId
}

// 회차
export interface IEpisode {
  name: string
  description: string
  tags: IEpisodeTag[] | mongoose.Types.ObjectId[]
}

// 회차 태그
export interface IEpisodeTag {
  name: string
  blocks: IBlock[] | mongoose.Types.ObjectId[]
}

// 블록 태그
export interface IBlock {
  id: string
  blockType: BlockType
  content: string
}

export enum BlockType {
  Description, // 묘사
  Script, // 대사
}

export interface IUser {
  uid: string
  name: string
}

// export interface IBlockMethods {}
//
// export type WordModel = Model<IBlock, {}, IBlockMethods>
// export type UserDoc = mongoose.Document<{}, {}, IWord> & {
//   _id: mongoose.Types.ObjectId
// } & IWord &
//   IWordMethods
