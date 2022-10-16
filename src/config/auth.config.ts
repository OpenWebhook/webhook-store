import { registerAs } from '@nestjs/config';

const authConfig = () => ({
  jwksUri:
    process.env.JWKS_URI ||
    `https://openwebhook-auth.herokuapp.com/.well-known/jwks.json`,
  isProtected: process.env.IS_PROTECTED === 'true' || false,
});

export default registerAs('auth', authConfig);
