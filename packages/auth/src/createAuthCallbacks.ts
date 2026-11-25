import { type NextAuthConfig, type Session } from 'next-auth';
import { type JWT } from 'next-auth/jwt';
import { type ApiSession, type ApiTokenAuthOptions } from './types.ts';

export const createPublicSession = (session: Session, token: JWT): Session => ({
  correlationId: token.correlationId,
  error: token.error,
  expires: session.expires,
  user: {
    email: session.user.email,
    id: token.sub ?? '',
    image: session.user.image,
    name: session.user.name,
    policies: token.policies ?? [],
    roles: token.roles ?? [],
  },
});

export const createApiSession = (session: Session, token: JWT): ApiSession => ({
  ...createPublicSession(session, token),
  ...(token.apiTokens && Date.now() < token.apiTokens.expiresAt && { apiAccessToken: token.apiTokens.accessToken }),
});

type AuthCallbacks = Required<Pick<NonNullable<NextAuthConfig['callbacks']>, 'jwt' | 'session'>>;

export const createAuthCallbacks = (
  { loadCurrentUser, refreshTokens }: ApiTokenAuthOptions,
  refreshBufferSeconds: number,
): AuthCallbacks => ({
  jwt: async ({ token, trigger, user }): Promise<JWT> => {
    if (trigger === 'signIn') {
      token.apiTokens = user.apiTokens;
      token.roles = user.roles;
      token.policies = user.policies;
    }

    if (trigger === 'signIn' || !token.correlationId) {
      token.correlationId = crypto.randomUUID();
    }

    const tokens = token.apiTokens;

    if (!tokens) {
      return token;
    }

    const shouldRefresh = Date.now() >= tokens.expiresAt - refreshBufferSeconds * 1000;

    if (!shouldRefresh && token.roles && token.policies) {
      return token;
    }

    try {
      const updatedTokens = shouldRefresh ? await refreshTokens(tokens.refreshToken) : tokens;
      const currentUser = await loadCurrentUser(updatedTokens.accessToken);
      token.apiTokens = updatedTokens;
      token.roles = currentUser.roles;
      token.policies = currentUser.policies;
      token.sub = currentUser.id;
      token.name = currentUser.name;
      token.email = currentUser.email;
      delete token.error;
    } catch {
      delete token.apiTokens;
      token.roles = [];
      token.policies = [];
      token.error = 'RefreshTokenError';
    }

    return token;
  },
  session: ({ session, token }): Session => createPublicSession(session, token),
});
