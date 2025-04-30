import { Module } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { AuthController } from "./auth.controller"
import { PassportModule } from "@nestjs/passport"
import { JwtModule } from "@nestjs/jwt"
import { JwtStrategy } from "./strategies/jwt.strategy"
import { KimustoryStrategy } from "./strategies/kimustory.strategy"
import { JwtAuthGuard } from "./jwt-auth.guard"
import { TypeOrmModule } from "@nestjs/typeorm"
import { UserEntity } from "../users/user.entity"

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "7d" },
      global: true,
    }),
    TypeOrmModule.forFeature([UserEntity]),
  ],
  providers: [AuthService, JwtAuthGuard, JwtStrategy, KimustoryStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
