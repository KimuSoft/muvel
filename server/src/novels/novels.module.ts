import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Novel } from "./novel.entity"
import { NovelsService } from './novels.service';

@Module({ imports: [TypeOrmModule.forFeature([Novel])], providers: [NovelsService] })
export class NovelsModule {}
