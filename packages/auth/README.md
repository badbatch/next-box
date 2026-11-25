# @next-box/auth

API-backed credentials authentication for Next.js applications.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

`@next-box/auth` uses Auth.js via the `next-auth` package. Auth.js provides the credentials provider, sign-in and sign-out handlers, and encrypted JWT session cookies. NextBox wires those pieces to your backend and adds API token refresh and session helpers for Server Components and API route handlers. Your application supplies the backend calls and authorization rules.

## Installation

```shell
npm add @next-box/auth next-auth@beta
```

The package is server-only and requires Next.js 16 or later and React 19 or later. Configure `AUTH_SECRET` in your application environment for Auth.js to encrypt session cookies.

## Usage

### Configure the credentials provider

Create one auth instance in a server module such as `auth.ts`. Set `credentials` to the field names your sign-in action passes to Auth.js. This example uses a username. An application that signs in with an email address can use an `email` field instead.

```ts
import { createApiTokenAuth } from '@next-box/auth';
import { authorizeCredentials, loadCurrentUser, refreshTokens } from './authService.ts';

export const { handlers, signIn, signOut, readApiSession, withApiSession } = createApiTokenAuth({
  authorize: authorizeCredentials,
  credentials: { username: { type: 'text' }, password: { type: 'password' } },
  loadCurrentUser,
  loadOptions: async () => ({ refreshBufferSeconds: 30, sessionMaxAgeSeconds: 3600 }),
  refreshTokens,
  signInPage: '/login',
});
```

Call `signIn('credentials', { username, password, redirectTo: '/' })` from your sign-in action. Pass a destination to `signOut({ redirectTo: '/login' })` when the user signs out. The application owns both destinations and any login form or error messages. If you omit `signInPage`, Auth.js supplies its default sign-in page.

### Implement the backend adapter

Implement the following callbacks with your backend client. Validate credentials and backend responses in the adapter before returning data to NextBox.

| Callback | What it returns |
| --- | --- |
| `authorize(credentials, request)` | An `ApiUser` with an `apiTokens` property after successful authentication. Return `null` or throw Auth.js's `CredentialsSignin` when credentials are rejected. Throw an error for service failures. |
| `refreshTokens(refreshToken)` | Replacement `ApiTokens` for the supplied refresh token. Throw if the backend rejects the refresh or returns invalid data. |
| `loadCurrentUser(accessToken)` | An `ApiUser` fetched with the supplied bearer token. Throw if the backend cannot return a valid user. |

`ApiUser` requires a stable `id` and arrays of string `roles` and `policies`. It also accepts `name` and `email`. Use empty arrays when a backend supplies no claims. The application interprets policy names and decides which ones to require.

`ApiTokens` contains `accessToken`, `refreshToken`, and `expiresAt` as an absolute Unix timestamp in milliseconds. If the backend returns an `expiresIn` value in seconds, convert it with `Date.now() + expiresIn * 1000` when you receive the tokens.

#### Example adapter for a JSON API

Suppose your backend exposes three endpoints. The paths and JSON fields here are examples. Change them to match your backend, or use your generated API client in the same three callbacks.

| Endpoint | Request | Successful response |
| --- | --- | --- |
| `POST /auth/login` | JSON with `username` and `password` | JSON with `accessToken`, `refreshToken`, and `expiresIn` in seconds |
| `POST /auth/refresh` | JSON with `refreshToken` | Replacement tokens in the same format |
| `GET /users/me` | `Authorization: Bearer <accessToken>` | JSON with `id`, `displayName`, `roles`, and `policies` |

Set `BACKEND_URL` to the backend's base URL in your server environment. This example uses Zod for runtime validation. Run `npm add zod` if your application does not already use it.

```ts
// authService.ts
import { type ApiTokenAuthOptions, type ApiTokens, type ApiUser } from '@next-box/auth';
import { z } from 'zod';

const credentialsSchema = z.object({
  password: z.string().min(1),
  username: z.string().min(1),
});

const tokenResponseSchema = z.object({
  accessToken: z.string().min(1),
  expiresIn: z.number().positive(),
  refreshToken: z.string().min(1),
});

const userResponseSchema = z.object({
  displayName: z.string(),
  id: z.string().min(1),
  policies: z.array(z.string()),
  roles: z.array(z.string()),
});

const getBackendUrl = (path: string): string => {
  const baseUrl = process.env.BACKEND_URL;

  if (!baseUrl) {
    throw new Error('BACKEND_URL is required');
  }

  return `${baseUrl.replace(/\/$/u, '')}${path}`;
};

const postJson = (path: string, body: object): Promise<Response> =>
  fetch(getBackendUrl(path), {
    body: JSON.stringify(body),
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });

const readApiTokens = async (response: Response): Promise<ApiTokens> => {
  if (!response.ok) {
    throw new Error(`Backend token request failed with status ${response.status}`);
  }

  const { accessToken, expiresIn, refreshToken } = tokenResponseSchema.parse(await response.json());
  return { accessToken, expiresAt: Date.now() + expiresIn * 1000, refreshToken };
};

export const loadCurrentUser = async (accessToken: string): Promise<ApiUser> => {
  const response = await fetch(getBackendUrl('/users/me'), {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Backend profile request failed with status ${response.status}`);
  }

  const { displayName, id, policies, roles } = userResponseSchema.parse(await response.json());
  return { id, name: displayName, policies, roles };
};

export const refreshTokens = async (refreshToken: string): Promise<ApiTokens> =>
  readApiTokens(await postJson('/auth/refresh', { refreshToken }));

export const authorizeCredentials: ApiTokenAuthOptions['authorize'] = async credentials => {
  const parsed = credentialsSchema.safeParse(credentials);

  if (!parsed.success) {
    return null;
  }

  const response = await postJson('/auth/login', parsed.data);

  if (response.status === 401) {
    return null;
  }

  const apiTokens = await readApiTokens(response);
  const user = await loadCurrentUser(apiTokens.accessToken);

  return { ...user, apiTokens };
};
```

Import these three functions into the `auth.ts` configuration above. On sign-in, Auth.js calls `authorizeCredentials`, which exchanges the credentials for tokens and loads the profile. If your login response already includes the profile, you can map it directly there. Keep `loadCurrentUser` available for session refresh so NextBox can update the user's access claims. If the backend uses a status other than `401` for invalid credentials, map that status to `null` in `authorizeCredentials`.

### Configure session lifetime and refresh

`loadOptions` supplies `sessionMaxAgeSeconds` for the Auth.js JWT session and `refreshBufferSeconds` for the backend access token. With a 30-second buffer, a refresh-capable session read attempts refresh once the access token is within 30 seconds of expiry or has already expired. The session lifetime and the backend access token expiry are independent.

NextBox uses the replacement access token to reload the user's identity, roles, and policies before updating the JWT. A valid token with missing claims triggers a profile reload without a token refresh. If refresh or profile loading fails, NextBox clears the API tokens and claims and sets `session.error` to `RefreshTokenError`. Route and page guards can use that error to require sign-in again.

Each sign-in gets a new `correlationId`, which stays stable across session reads and token refreshes. The refresh flow assumes concurrent requests can reuse a refresh token. Backends that invalidate it on first use need coordination across requests and application instances.

### Expose the public session

Export the Auth.js handlers from `app/api/auth/[...nextauth]/route.ts`.

```ts
import { handlers } from '@/auth';

export const { GET, POST } = handlers;
```

The browser-facing `/api/auth/session` response includes session expiry, user identity, roles, policies, correlation ID, and any refresh error. Backend tokens stay in the encrypted HttpOnly session cookie. Use the public session data to inform the UI and enforce access on the server.

### Read the session in Server Components

Call `readApiSession()` from a Server Component or its server-side data loader. React caches the read within the render. The result is an `ApiSession` or `null`. An `ApiSession` includes `apiAccessToken` while the token is valid. Server Components skip refresh because they cannot write the replacement cookie.

Check the session and any application policy before loading protected data. If the session is usable but the access token has expired, route that backend call through a browser-initiated BFF request so the response can persist fresh cookies. Keep the private session and bearer token on the server.

### Refresh and authorize BFF requests

Wrap the route logic with `withApiSession(request, handler)`. Auth.js resolves the session and attempts refresh when required before invoking the handler. It appends session cookie updates to the returned response, including when the handler denies access based on refreshed policies.

```ts
import { type NextRequest } from 'next/server';
import { withApiSession } from '@/auth';
import { fetchAdminRecords } from '@/server/records';

export const GET = (request: NextRequest): Promise<Response> =>
  withApiSession(request, async session => {
    if (!session?.apiAccessToken || session.error) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (!session.user.policies.includes('AdminAccess')) {
      return Response.json({ error: 'Access denied' }, { status: 403 });
    }

    const records = await fetchAdminRecords(session.apiAccessToken);
    return Response.json(records);
  });
```

`withApiSession` passes the session to the handler even when the session is missing or refresh fails. The application decides the response and authorization requirements. Forward the access token to the backend from inside the handler.

## Changelog

See the [changelog](../../CHANGELOG.md) for features, fixes, and other changes included in each major, minor, and patch release.

## License

`@next-box/auth` is [MIT Licensed](LICENSE).
