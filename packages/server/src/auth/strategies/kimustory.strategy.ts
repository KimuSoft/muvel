import { Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import * as OAuth2Strategy from "passport-oauth2"
import { VerifyCallback } from "passport-oauth2"
import axios from "axios"
import { AuthService } from "../auth.service"

const server = "https://accounts.kimustory.net"

interface KimustoryProfile {
  id: string
  username: string
  email: string
  avatar: string
  created_at: string
  updated_at: string
}

@Injectable()
export class KimustoryStrategy extends PassportStrategy(
  OAuth2Strategy,
  "kimustory",
) {
  constructor(private authService: AuthService) {
    super({
      authorizationURL: server + "/api/oauth2/authorize",
      tokenURL: server + "/api/oauth2/token",
      clientID: process.env.KIMUSTORY_CLIENT_ID!,
      clientSecret: process.env.KIMUSTORY_CLIENT_SECRET!,
      callbackURL: process.env.KIMUSTORY_CALLBACK_URL!,
      scope: "identify",
      passReqToCallback: true,
    })
  }

  async userProfile(token: string, done: VerifyCallback) {
    const res = await axios.get(server + "/api/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
    done(null, res.data)
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: KimustoryProfile,
    done: VerifyCallback,
  ) {
    console.log(profile)
    const user = await this.authService.validateUser(
      "kimustory",
      profile.id,
      profile.username,
      server + "/avatars/" + profile.avatar,
    )
    // @ts-expect-error 타입 정의가 더 귀찮음
    user._authFlow = req.query?.state ?? "web"
    done(null, user)
  }
}
