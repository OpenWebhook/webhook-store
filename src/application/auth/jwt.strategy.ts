import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import * as jwksRsa from 'jwks-rsa';
import authConfig from '../../config/auth.config';
import { ConfigType } from '@nestjs/config';

export const userPassportStrayegyName = 'user-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
  userPassportStrayegyName,
) {
  constructor(
    @Inject(authConfig.KEY)
    config: ConfigType<typeof authConfig>,
  ) {
    const jwksUri = config.jwksUri;
    const strategyOption: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri,
      }),
    };
    super(strategyOption);
  }

  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username };
  }
}
