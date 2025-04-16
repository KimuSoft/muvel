import { Module } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { AuthController } from "./auth.controller"
import { UsersModule } from "../users/users.module"
import { PassportModule } from "@nestjs/passport"
import { JwtModule } from "@nestjs/jwt"
import { JwtStrategy } from "./strategies/jwt.strategy"
import { KimustoryStrategy } from "./strategies/kimustory.strategy"
import { JwtAuthGuard } from "./jwt-auth.guard"

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET!,
      signOptions: { expiresIn: "1d" },
      global: true,
    }),
  ],
  providers: [AuthService, JwtAuthGuard, JwtStrategy, KimustoryStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
