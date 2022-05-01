import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import * as jwksRsa from 'jwks-rsa';
import { ConfigService } from '@nestjs/config';
import { AuthConfig } from 'src/config/auth.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const jwksUri = configService.get<AuthConfig>('auth').jwksUri;
    console.log(jwksUri);
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
