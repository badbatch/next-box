import { type NextRequest } from 'next/server.js';
import NextAuth, { type NextAuthConfig, type NextAuthResult } from 'next-auth';
import { type JWT } from 'next-auth/jwt';
import Credentials from 'next-auth/providers/credentials';
import { cache } from 'react';
import { createApiSession, createAuthCallbacks } from './createAuthCallbacks.ts';
import { type ApiSession, type ApiTokenAuthOptions } from './types.ts';

type ApiTokenAuth = NextAuthResult & {
  createAuthConfig: () => Promise<NextAuthConfig>;
  readApiSession: () => Promise<ApiSession | null>;
  withApiSession: (
    request: NextRequest,
    handler: (session: ApiSession | null) => Promise<Response>,
  ) => Promise<Response>;
};

export const createApiTokenAuth = (options: ApiTokenAuthOptions): ApiTokenAuth => {
  const provider = Credentials({ authorize: options.authorize, credentials: options.credentials });

  const createAuthConfig = async (): Promise<NextAuthConfig> => {
    const { refreshBufferSeconds, sessionMaxAgeSeconds } = await options.loadOptions();

    return {
      callbacks: createAuthCallbacks(options, refreshBufferSeconds),
      pages: options.signInPage ? { signIn: options.signInPage } : undefined,
      providers: [provider],
      session: { maxAge: sessionMaxAgeSeconds, strategy: 'jwt' },
    };
  };

  const createPrivateConfig = async (): Promise<NextAuthConfig> => {
    const config = await createAuthConfig();

    return {
      ...config,
      callbacks: { ...config.callbacks, session: ({ session, token }) => createApiSession(session, token) },
    };
  };

  const { auth: readSession } = NextAuth(async () => {
    const config = await createPrivateConfig();

    // Server Components cannot persist refreshed tokens in a response cookie.
    return { ...config, callbacks: { ...config.callbacks, jwt: ({ token }): JWT => token } };
  });

  const { auth: wrapApiRequest } = NextAuth(createPrivateConfig);

  return {
    ...NextAuth(createAuthConfig),
    createAuthConfig,
    readApiSession: cache(async (): Promise<ApiSession | null> => readSession()),
    withApiSession: async (request, handler): Promise<Response> => {
      // NextAuth resolves its route wrapper asynchronously with lazy configuration.
      const route = await Promise.resolve(wrapApiRequest(async ({ auth }) => handler(auth)));
      const response = await route(request, { params: Promise.resolve({}) });

      if (!response) {
        throw new Error('Authentication handler returned no response');
      }

      return response;
    },
  };
};
