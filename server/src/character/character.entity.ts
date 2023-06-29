// import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
// import { Importance } from "../types"
// import { Novel } from "../novels/novel.entity"
//
// @Entity()
// export class Character {
//   @PrimaryGeneratedColumn("uuid")
//   id: string
//
//   @Column()
//   name: string
//
//   @Column()
//   description: string
//
//   @Column()
//   age: number
//
//   @Column()
//   gender: string
//
//   @Column()
//   weight: number
//
//   @Column()
//   height: number
//
//   @Column()
//   importance: Importance
//
//   @Column()
//   species: string
//
//   @ManyToOne(() => Novel, (novel) => novel.characters, {
//     onDelete: "CASCADE",
//   })
//   episode: Novel
// }
