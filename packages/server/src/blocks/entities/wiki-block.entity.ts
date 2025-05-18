import { WikiBlock, WikiBlockType } from "muvel-api-types"
import { Column, Entity, Index, ManyToOne } from "typeorm"
import { BaseBlockEntity } from "./base-block.entity"
import { WikiPageEntity } from "../../wiki-pages/wiki-page.entity"

@Index("IDX_wiki_block_page_order", ["wikiPageId", "order"])
@Entity("wiki_block")
export class WikiBlockEntity
  extends BaseBlockEntity<WikiBlockType>
  implements Omit<WikiBlock, "updatedAt">
{
  @Column({ enum: WikiBlockType, default: WikiBlockType.Paragraph })
  blockType: WikiBlockType

  /** relations */

  @ManyToOne(() => WikiPageEntity, (wikiPage) => wikiPage.blocks, {
    onDelete: "CASCADE",
  })
  episode: WikiPageEntity

  @Column({ nullable: true })
  wikiPageId: string
}
