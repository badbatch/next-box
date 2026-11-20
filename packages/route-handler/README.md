# @next-box/route-handler

A library for defining and configuring Next.js route handlers.

[![npm version](https://badge.fury.io/js/%40next-box%2Froute-handler.svg)](https://badge.fury.io/js/%40next-box%2Froute-handler)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Next.js route handlers often need to share request validation, authentication, logging, and other cross-cutting behavior. `@next-box/route-handler` provides typed middleware and handler factories so that common behavior can be composed once and reused across routes.

## Installation

```shell
npm add @next-box/route-handler
```

The package is server-only and requires Next.js 16 or later.

## Usage

### Define middleware

Middleware receives the `NextRequest`, the route context, the context it requires, and a `next` function. It can return a response directly or call `next` to continue. The second generic type describes the context that must already be available from the base context or earlier middleware; the third describes context this middleware adds for later middleware and the handler. TypeScript checks those requirements in middleware order.

```ts
import { createMiddleware } from '@next-box/route-handler';

type User = { id: string; name: string };

export const withUser = createMiddleware<
  { id: string },
  { requestId: string },
  { user: User }
>(async (_request, { params }, context, next) => {
  const { id } = await params!;
  const user = await findUser(id);

  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  return next({ context: { user } });
});
```

The `next` function accepts an optional `context` object. Its fields are merged into the accumulated context passed to subsequent middleware and the handler.

### Define a route handler

Use `defineHandler` to configure middleware and a handler for one route. The handler receives the accumulated context as its third argument.

The returned function takes the initial context as its third argument. Context added by middleware is built as the middleware chain runs, so callers do not need to pass those added values.

```ts
import { defineHandler } from '@next-box/route-handler';
import { withUser } from './withUser.ts';

export const GET = defineHandler({
  context: { requestId: 'example-request-id' },
  middleware: [withUser],
  handler: async (_request, _routeContext, { user }) => {
    return Response.json(user);
  },
});
```

The returned function has the signature expected by a Next.js route handler, including the asynchronous `params` route context used by current Next.js versions.

### Share defaults with a handler factory

Use `createHandlerFactory` when multiple routes share initial context or middleware. Route-specific middleware can be added to the factory defaults.

```ts
import { createHandlerFactory } from '@next-box/route-handler';
import { withUser } from './withUser.ts';

const createApiHandler = createHandlerFactory({
  context: { requestId: 'example-request-id' },
  middleware: [withUser],
});

export const GET = createApiHandler({
  handler: async (_request, _routeContext, { requestId, user }) => {
    return Response.json({ requestId, user });
  },
});
```

Factory context values are combined with the context supplied when Next.js invokes the handler. Middleware runs in array order, and each middleware must call `next` for later middleware and the route handler to run.

### Validate requests

`defineHandler` accepts a `validation` object with schemas for the request body, headers, search parameters, and route parameters. Each schema must expose a `parse(input)` method, which can be synchronous or asynchronous. A failed parse returns a `400` JSON response by default; provide `onValidationError` to customize that response. Empty request data is passed to its schema as `undefined` for a missing body or params object, and as an empty object for headers or search parameters. Repeated search parameter keys are passed as arrays of strings.

```ts
const handler = defineHandler({
  validation: {
    body: bodySchema,
    headers: headersSchema,
    searchParams: searchParamsSchema,
    params: paramsSchema,
  },
  onValidationError: errors =>
    Response.json({ errors }, { status: 422 }),
  handler: async (_request, _routeContext, _context) => {
    return Response.json({ ok: true });
  },
});
```

Validation errors are collected across the configured request parts before the handler runs. `ValidationError` is exported for custom schema integrations. Other thrown errors are also converted into validation errors, preserving compatible `issues` arrays when available.

### Define a server operation

Use `defineOperation` for work that should be called directly from Server Components or other server code. An operation validates its input, receives explicit context, and returns a tagged result. It does not construct a request or response.

```ts
import { defineOperation, ResultType } from '@next-box/route-handler';
import { z } from 'zod';

type Session = { userId: string };
type User = { id: string; name: string };

export const getUser = defineOperation({
  validation: z.object({ id: z.string() }),
  context: { session: null as Session | null },
  handler: async ({ input, context }) => {
    if (!context.session) {
      return { type: ResultType.Unauthorized };
    }

    const user = await findUser(input.id, context.session);

    if (!user) {
      return { type: ResultType.NotFound };
    }

    return { type: ResultType.Success, data: user };
  },
});
```

The schema's parsed output is the handler's `input` type. The configured context provides its type and defaults; call-time context values override those defaults.

```tsx
import { notFound, redirect } from 'next/navigation';
import { ResultType } from '@next-box/route-handler';
import { getUser } from '@/lib/operations/getUser';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  
  const result = await getUser({
    input: await params,
    context: { session },
  });

  switch (result.type) {
    case ResultType.Success:
      return <UserDetails user={result.data} />;

    case ResultType.Unauthorized:
      redirect('/login');

    case ResultType.NotFound:
    case ResultType.ValidationError:
      notFound();
  }
}
```

Validation failures return `ResultType.ValidationError` with the collected validation errors. Unexpected exceptions from the operation handler propagate to the caller.

If a route should call the same operation, `mapOperationResultToResponse` maps its result to the agreed HTTP status and JSON body. The existing `defineHandler` pipeline remains independent; the route opts into the operation explicitly.

```ts
import { defineHandler, mapOperationResultToResponse } from '@next-box/route-handler';
import { getUser } from '@/lib/operations/getUser';

export const GET = defineHandler({
  handler: async (request, { params }) =>
    mapOperationResultToResponse(
      await getUser({
        input: await params!,
        context: { session: await getSession(request.headers) },
      }),
    ),
});
```

## API

- `createMiddleware` preserves the middleware's parameter, input-context, and added-context types.
- `defineHandler` creates a route handler from an optional context, middleware list, request validation, and handler function.
- `createHandlerFactory` creates a reusable handler configuration with default context and middleware.
- `defineOperation` creates a request-free, validated operation for direct server-side calls.
- `mapOperationResultToResponse` optionally maps an operation result to an HTTP response.
- `Handler`, `Middleware`, `RouteContext`, `Validation`, and related types are exported from the package entry point.

## Changelog

See the [changelog](../../CHANGELOG.md) for features, fixes, and other changes included in each major, minor, and patch release.

## License

`@next-box/route-handler` is [MIT Licensed](LICENSE).
