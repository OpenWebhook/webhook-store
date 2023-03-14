import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { adminStrategyName } from '../application/auth/basic.strategy';

@Injectable()
export class AdminGuard extends AuthGuard(adminStrategyName) {}
