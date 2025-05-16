import { Controller, Get, Post, UseInterceptors } from "@nestjs/common"
import { CacheInterceptor, CacheTTL } from "@nestjs/cache-manager"
import { StatisticsService } from "./statistics.service"

@Controller("statistics")
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(10 * 60 * 1000) // 10분 (600초)
  @Get()
  async getStatistics() {
    const stat = await this.statisticsService.getStatistics()
    const now = new Date()

    return {
      ...stat,
      updatedAt: now.toISOString(),
    }
  }

  @Post("rating-cache")
  async ratingCache() {
    return await this.statisticsService.migrateAiRatingFromAnalysis()
  }
}
