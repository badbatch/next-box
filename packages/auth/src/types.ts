import { type DefaultSession, type Session } from 'next-auth';
import { type CredentialsConfig } from 'next-auth/providers/credentials';
import 'next-auth/jwt';

export type ApiTokens = {
  accessToken: string;
  expiresAt: number;
  refreshToken: string;
};

export type ApiUser = {
  email?: string | null;
  id: string;
  name?: string | null;
  policies: string[];
  roles: string[];
};

export type ApiSession = Session & { apiAccessToken?: string };

export type ApiTokenAuthOptions = {
  authorize: (
    ...args: Parameters<CredentialsConfig['authorize']>
  ) => Promise<(ApiUser & { apiTokens: ApiTokens }) | null>;
  credentials: CredentialsConfig['credentials'];
  loadCurrentUser: (accessToken: string) => Promise<ApiUser>;
  loadOptions: () => Promise<{ refreshBufferSeconds: number; sessionMaxAgeSeconds: number }>;
  refreshTokens: (refreshToken: string) => Promise<ApiTokens>;
  signInPage?: string;
};

declare module 'next-auth' {
  interface User {
    apiTokens?: ApiTokens;
    policies?: string[];
    roles?: string[];
  }

  interface Session {
    correlationId?: string;
    error?: 'RefreshTokenError';
    user: { id: string; policies: string[]; roles: string[] } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    apiTokens?: ApiTokens;
    correlationId?: string;
    error?: 'RefreshTokenError';
    policies?: string[];
    roles?: string[];
  }
}
