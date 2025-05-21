import { Column, Entity, Index, ManyToOne } from "typeorm"
import { EpisodeEntity } from "../../episodes/entities/episode.entity"
import { EpisodeBlock, EpisodeBlockType } from "muvel-api-types"
import { BaseBlockEntity } from "./base-block.entity"

@Index("IDX_block_episode_order", ["episodeId", "order"])
@Entity("block")
export class EpisodeBlockEntity
  extends BaseBlockEntity<EpisodeBlockType>
  implements Omit<EpisodeBlock, "updatedAt">
{
  @Column({ enum: EpisodeBlockType, default: EpisodeBlockType.Describe })
  blockType: EpisodeBlockType

  /** relations */

  @ManyToOne(() => EpisodeEntity, (episode) => episode.blocks, {
    onDelete: "CASCADE",
  })
  episode: EpisodeEntity

  @Column({ nullable: true })
  episodeId: string
}
