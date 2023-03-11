import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Block } from "./block.entity"
import { BlockType } from "../types"
import { Episode } from "../episodes/episode.entity"

@Injectable()
export class BlocksService {
  constructor(
    @InjectRepository(Block)
    private blocksRepository: Repository<Block>
  ) {}

  async create(content: string, order?: number) {
    if (!order) {
      const lastBlock = await this.blocksRepository.findOne({
        order: { order: "DESC" },
      })
      order = lastBlock.order + 1
    }

    const block = new Block()
    block.blockType = BlockType.Describe
    block.content = content
    block.order = order

    return this.blocksRepository.save(block)
  }

  async upsert(
    blocks: {
      id: string
      content: string
      blockType: BlockType
      episode: Episode
      order: number
    }[]
  ) {
    return this.blocksRepository.upsert(blocks, ["id"])
  }

  async delete(id: string) {
    return this.blocksRepository.delete(id)
  }
}
