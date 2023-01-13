import { Controller, Get, Param, Query } from "@nestjs/common"
import { AppService } from "./app.service"

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello()
  }

  @Get("dev")
  queryString(@Query("id") id: string): string {
    return id
  }

  @Get("paring/:id")
  param(@Param("id") id: string): string {
    return id
  }
}
