import { Column, Entity, Index, ManyToOne } from "typeorm"
import { EpisodeEntity } from "../../episodes/entities/episode.entity"
import { BlockType, EpisodeBlock } from "muvel-api-types"
import { BaseBlockEntity } from "./base-block.entity"

@Index("IDX_block_episode_order", ["episodeId", "order"])
@Entity("block")
export class BlockEntity
  extends BaseBlockEntity<BlockType>
  implements Omit<EpisodeBlock, "updatedAt">
{
  @Column({ enum: BlockType, default: BlockType.Describe })
  blockType: BlockType

  /** relations */

  @ManyToOne(() => EpisodeEntity, (episode) => episode.blocks, {
    onDelete: "CASCADE",
  })
  episode: EpisodeEntity

  @Column({ nullable: true })
  episodeId: string
}
