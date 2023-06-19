import { Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { Profile, Strategy } from "passport-discord"
import { AuthService } from "../auth.service"

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, "discord") {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      scope: ["identify"],
      callbackURL: process.env.DISCORD_CALLBACK_URL!,
    })
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    return this.authService.validateUser(
      "discord",
      profile.id,
      profile.username,
      profile.avatar
        ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${
            profile.avatar.startsWith("a_") ? "gif" : "png"
          }`
        : `https://cdn.discordapp.com/embed/avatars/${
            +profile.discriminator % 5
          }.png`
    )
  }
}
