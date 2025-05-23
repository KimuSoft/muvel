import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from "typeorm"
import { NovelEntity } from "../novels/novel.entity"
import { WikiPage, WikiPageCategory } from "muvel-api-types"
import { WikiBlockEntity } from "../blocks/entities/wiki-block.entity"

@Entity("wiki_page")
export class WikiPageEntity
  implements Omit<WikiPage, "createdAt" | "updatedAt">
{
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  title: string

  @Column({ type: "text", nullable: true })
  avatar: string | null = null

  @Column({ type: "text", nullable: true })
  summary: string | null

  @Column({ type: "text", enum: WikiPageCategory, nullable: true })
  category: WikiPageCategory | null

  @Column({ type: "text", array: true, default: [] })
  tags: string[]

  @Column({ type: "text", nullable: true })
  thumbnail: string | null

  @Column({ type: "jsonb", default: {} })
  attributes: Record<string, string>

  /** Relations */

  @ManyToOne(() => NovelEntity, (novel) => novel.wikiPages, {
    onDelete: "CASCADE",
  })
  novel: NovelEntity

  @RelationId((character: WikiPageEntity) => character.novel)
  novelId: string

  @OneToMany(() => WikiBlockEntity, (block) => block.wikiPage, {
    cascade: true,
  })
  blocks: WikiBlockEntity[]

  /** Dates */

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date

  @DeleteDateColumn({ type: "timestamptz" })
  deletedAt: Date | null
}
