import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Episode } from "./episode.entity"
import { EpisodesService } from './episodes.service';

@Module({ imports: [TypeOrmModule.forFeature([Episode])], providers: [EpisodesService] })
export class EpisodesModule {}
