import { Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { Profile, Strategy } from "passport-google-oauth20"
import { GoogleOAuthResult } from "./google-auth.guard"

type GoogleStrategyOptions = {
  clientID: string
  clientSecret: string
  callbackURL: string
  scope: string[]
  accessType?: "offline" | "online"
  prompt?: string
}

@Injectable()
export class GoogleDriveStrategy extends PassportStrategy(Strategy, "google") {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ["https://www.googleapis.com/auth/drive.file", "profile", "email"],
      accessType: "offline",
      prompt: "consent",
    } as GoogleStrategyOptions)
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<GoogleOAuthResult> {
    return {
      accessToken,
      refreshToken,
      profile,
    }
  }
}
