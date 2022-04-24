import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  jwtPublicKey: process.env.JWT_PUBLIC_KEY,
}));
