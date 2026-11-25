/** @jest-environment node */
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { type Session } from 'next-auth';
import { type JWT } from 'next-auth/jwt';
import { createApiSession, createAuthCallbacks, createPublicSession } from './createAuthCallbacks.ts';
import { type ApiTokenAuthOptions, type ApiTokens, type ApiUser } from './types.ts';

const now = Date.parse('2026-01-01T00:00:00Z');
const refreshBufferSeconds = 30;
const correlationId = 'session-correlation-id';

const apiTokens: ApiTokens = {
  accessToken: 'access-token',
  expiresAt: now + 60_000,
  refreshToken: 'refresh-token',
};

const replacementTokens: ApiTokens = {
  accessToken: 'replacement-access-token',
  expiresAt: now + 120_000,
  refreshToken: 'replacement-refresh-token',
};

const currentUser: ApiUser = {
  email: 'user@example.com',
  id: 'user-id',
  name: 'Updated User',
  policies: ['ReadRecords'],
  roles: ['Reader'],
};

// The Auth.js JWT callback type requires an account field and allows null.
// eslint-disable-next-line unicorn/no-null
const sessionRead = { account: null, user: currentUser };

const session: Session = {
  expires: '2026-01-01T01:00:00Z',
  user: { id: 'user-id', name: 'Original User', policies: [], roles: [] },
};

const createCallbacksFixture = () => {
  const loadCurrentUser = jest.fn<ApiTokenAuthOptions['loadCurrentUser']>().mockResolvedValue(currentUser);
  const refreshTokens = jest.fn<ApiTokenAuthOptions['refreshTokens']>().mockResolvedValue(replacementTokens);

  const { jwt } = createAuthCallbacks(
    {
      authorize: jest.fn<ApiTokenAuthOptions['authorize']>(),
      credentials: {},
      loadCurrentUser,
      loadOptions: jest.fn<ApiTokenAuthOptions['loadOptions']>(),
      refreshTokens,
    },
    refreshBufferSeconds,
  );

  return { jwt, loadCurrentUser, refreshTokens };
};

const createJwt = (tokens = apiTokens): JWT => ({
  apiTokens: tokens,
  correlationId,
  policies: ['WriteRecords'],
  roles: ['Writer'],
});

beforeEach(() => {
  jest.spyOn(Date, 'now').mockReturnValue(now);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('JWT callback', () => {
  it('When a user signs in, then the JWT stores credentials and claims and starts a new correlation ID', async () => {
    // Arrange
    const { jwt, loadCurrentUser, refreshTokens } = createCallbacksFixture();
    const account = { provider: 'credentials', providerAccountId: currentUser.id, type: 'credentials' as const };
    const user = { ...currentUser, apiTokens };

    // Act
    const result = await jwt({ account, token: { correlationId }, trigger: 'signIn', user });

    // Assert
    expect(result).toMatchObject({
      apiTokens,
      correlationId: expect.any(String),
      policies: currentUser.policies,
      roles: currentUser.roles,
    });

    expect(result?.correlationId).not.toBe(correlationId);
    expect(loadCurrentUser).not.toHaveBeenCalled();
    expect(refreshTokens).not.toHaveBeenCalled();
  });

  it('When the access token is outside the refresh buffer and claims are present, then the JWT is reused', async () => {
    // Arrange
    const { jwt, loadCurrentUser, refreshTokens } = createCallbacksFixture();
    const token = createJwt();

    // Act
    const result = await jwt({ ...sessionRead, token });

    // Assert
    expect(result).toBe(token);
    expect(result?.correlationId).toBe(correlationId);
    expect(loadCurrentUser).not.toHaveBeenCalled();
    expect(refreshTokens).not.toHaveBeenCalled();
  });

  it('When the access token reaches the refresh buffer, then replacement tokens and updated claims are saved', async () => {
    // Arrange
    const { jwt, loadCurrentUser, refreshTokens } = createCallbacksFixture();
    const token = createJwt({ ...apiTokens, expiresAt: now + refreshBufferSeconds * 1000 });

    // Act
    const result = await jwt({ ...sessionRead, token });

    // Assert
    expect(refreshTokens).toHaveBeenCalledWith(apiTokens.refreshToken);
    expect(loadCurrentUser).toHaveBeenCalledWith(replacementTokens.accessToken);

    expect(result).toMatchObject({
      apiTokens: replacementTokens,
      correlationId,
      email: currentUser.email,
      name: currentUser.name,
      policies: currentUser.policies,
      roles: currentUser.roles,
      sub: currentUser.id,
    });
  });

  it('When claims are missing from a JWT with a valid access token, then the profile is loaded without refresh', async () => {
    // Arrange
    const { jwt, loadCurrentUser, refreshTokens } = createCallbacksFixture();

    // Act
    const result = await jwt({ ...sessionRead, token: { apiTokens, correlationId } });

    // Assert
    expect(refreshTokens).not.toHaveBeenCalled();
    expect(loadCurrentUser).toHaveBeenCalledWith(apiTokens.accessToken);
    expect(result).toMatchObject({ apiTokens, policies: currentUser.policies, roles: currentUser.roles });
  });

  it('When token refresh fails, then credentials and claims are cleared and the profile is skipped', async () => {
    // Arrange
    const { jwt, loadCurrentUser, refreshTokens } = createCallbacksFixture();
    refreshTokens.mockRejectedValue(new Error('Refresh rejected'));

    // Act
    const result = await jwt({ ...sessionRead, token: createJwt({ ...apiTokens, expiresAt: now }) });

    // Assert
    expect(loadCurrentUser).not.toHaveBeenCalled();
    expect(result).not.toHaveProperty('apiTokens');
    expect(result).toMatchObject({ correlationId, error: 'RefreshTokenError', policies: [], roles: [] });
  });

  it('When profile loading fails after refresh, then replacement credentials and claims are cleared', async () => {
    // Arrange
    const { jwt, loadCurrentUser } = createCallbacksFixture();
    loadCurrentUser.mockRejectedValue(new Error('Profile unavailable'));

    // Act
    const result = await jwt({ ...sessionRead, token: createJwt({ ...apiTokens, expiresAt: now }) });

    // Assert
    expect(loadCurrentUser).toHaveBeenCalledWith(replacementTokens.accessToken);
    expect(result).not.toHaveProperty('apiTokens');
    expect(result).toMatchObject({ correlationId, error: 'RefreshTokenError', policies: [], roles: [] });
  });
});

describe('Session creation', () => {
  it('When a public session is created, then it includes user claims and omits API credentials', () => {
    // Arrange
    const token = { ...createJwt(), sub: currentUser.id };

    // Act
    const result = createPublicSession(session, token);

    // Assert
    expect(result).toStrictEqual({
      correlationId,
      error: undefined,
      expires: session.expires,
      user: {
        email: undefined,
        id: currentUser.id,
        image: undefined,
        name: session.user.name,
        policies: token.policies,
        roles: token.roles,
      },
    });
  });

  it('When a private session has a valid token, then it includes the access token and omits the refresh token', () => {
    // Arrange
    const token = createJwt();

    // Act
    const result = createApiSession(session, token);

    // Assert
    expect(result).toStrictEqual({ ...createPublicSession(session, token), apiAccessToken: apiTokens.accessToken });
  });

  it('When a private session has an expired token, then the bearer token is omitted', () => {
    // Arrange
    const token = createJwt({ ...apiTokens, expiresAt: now });

    // Act
    const result = createApiSession(session, token);

    // Assert
    expect(result).not.toHaveProperty('apiAccessToken');
  });
});
