import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { adminPassportStrategyName } from '../../application/auth/basic.strategy';

@Injectable()
export class AdminGuard extends AuthGuard(adminPassportStrategyName) {}
