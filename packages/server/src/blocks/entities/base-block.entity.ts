import { Column, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import { BaseBlock, BlockAttrs, PMNodeJSON } from "muvel-api-types"

export abstract class BaseBlockEntity<BType extends string>
  implements Omit<BaseBlock<BType>, "updatedAt">
{
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  text: string

  @Column({ type: "jsonb", default: [] })
  content: PMNodeJSON[]

  @Column({ type: "jsonb", nullable: true })
  attr: BlockAttrs | null

  // blockType은 자식 엔티티에서 반드시 @Column() 지정할 것
  blockType: BType

  @Column()
  order: number

  @UpdateDateColumn()
  updatedAt: Date
}
