import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import authConfig from '../../config/auth.config';
import { AdminStrategy } from './basic.strategy';

@Module({
  imports: [ConfigModule.forRoot({ load: [authConfig] })],
  providers: [AuthService, JwtStrategy, AdminStrategy],
  exports: [AuthService],
})
export class AuthModule {}
