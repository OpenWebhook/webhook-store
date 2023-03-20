import { Injectable } from '@nestjs/common';

export type AuthMetadata =
  | { protected: true; ghOrg: string }
  | { protected: false };
@Injectable()
export class AuthService {
  getAuthMetadata(): AuthMetadata {
    return { protected: false };
  }
}
