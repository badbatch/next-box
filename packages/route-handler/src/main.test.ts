import { describe, expect, it, jest } from '@jest/globals';
import { NextRequest } from 'next/server.js';
import { z } from 'zod';
import { type Schema } from './types.ts';

jest.unstable_mockModule('server-only', () => ({}));

const { ValidationError, createHandlerFactory, createMiddleware, defineHandler } = await import('./index.ts');

type NextRequestInit = NonNullable<ConstructorParameters<typeof NextRequest>[1]>;

const createRequest = (url: string, init?: NextRequestInit) => new NextRequest(url, init);

const emptyValidation = {
  body: undefined,
  headers: undefined,
  params: undefined,
  searchParams: undefined,
};

const createRequireTokenMiddleware = () =>
  createMiddleware(request =>
    request.headers.has('authorization')
      ? Response.json({ error: 'Expected middleware to stop' }, { status: 500 })
      : Response.json({ error: 'Unauthorized' }, { status: 401 }),
  );

describe('route handler integration', () => {
  it('When middleware prerequisites are missing, then TypeScript rejects the middleware chain', () => {
    // Arrange
    const tenantMiddleware = createMiddleware<{ id: string }, { tenant: { id: string } }, { authorized: true }>(
      async (_request, _routeContext, _context, next) => next({ context: { authorized: true } }),
    );

    // Act
    const handler = defineHandler<object, { id: string }, [typeof tenantMiddleware]>({
      handler: () => Response.json({ ok: true }),
      // @ts-expect-error The chain has no base or earlier middleware that provides tenant.
      middleware: [tenantMiddleware],
    });

    // Assert
    expect(handler).toBeDefined();
  });

  it('When middleware adds context in sequence, then the handler receives the combined context', async () => {
    // Arrange
    const order: string[] = [];

    const loadUser = createMiddleware<{ id: string }, { requestId: string }, { user: { id: string } }>(
      async (_request, { params }, context, next) => {
        order.push(`load:${context.requestId}`);
        const { id } = await params!;
        return next({ context: { user: { id } } });
      },
    );

    const recordUser = createMiddleware<{ id: string }, { requestId: string; user: { id: string } }, { logged: true }>(
      async (_request, _routeContext, context, next) => {
        order.push(`record:${context.user.id}`);
        return next({ context: { logged: true } });
      },
    );

    const handler = defineHandler<{ requestId: string }, { id: string }, [typeof loadUser, typeof recordUser]>({
      context: { requestId: 'request-123' },
      handler: (_request, _routeContext, context) => {
        order.push(`handler:${context.user.id}:${String(context.logged)}`);

        return Response.json({ logged: context.logged, requestId: context.requestId, userId: context.user.id });
      },
      middleware: [loadUser, recordUser],
    });

    // Act
    const handlerContext = { requestId: 'request-123' };

    const response = await handler(
      createRequest('http://localhost/users/42'),
      { params: Promise.resolve({ id: '42' }) },
      handlerContext,
    );

    // Assert
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ logged: true, requestId: 'request-123', userId: '42' });
    expect(order).toEqual(['load:request-123', 'record:42', 'handler:42:true']);
  });

  it('When middleware returns a response without calling next, then later middleware and the handler do not run', async () => {
    // Arrange
    const handlerFn = jest.fn(() => Response.json({ ok: true }));
    const requireToken = createRequireTokenMiddleware();

    const handler = defineHandler({ handler: handlerFn, middleware: [requireToken] });

    // Act
    const response = await handler(createRequest('http://localhost/private'), {}, {});

    // Assert
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' });
    expect(handlerFn).not.toHaveBeenCalled();
  });

  it('When a handler factory has defaults, then route middleware and the handler receive them in order', async () => {
    // Arrange
    const order: string[] = [];

    const defaultMiddleware = createMiddleware<
      Record<string, string>,
      { source: string },
      { defaultMiddlewareRan: true }
    >(async (_request, _routeContext, _context, next) => {
      order.push('default');

      return next({ context: { defaultMiddlewareRan: true } });
    });

    const routeMiddleware = createMiddleware<
      Record<string, string>,
      { defaultMiddlewareRan: true; source: string },
      { routeMiddlewareRan: true }
    >(async (_request, _routeContext, _context, next) => {
      order.push('route');

      return next({ context: { routeMiddlewareRan: true } });
    });

    const createHandler = createHandlerFactory({
      context: { source: 'factory' },
      middleware: [defaultMiddleware],
    });

    const handler = createHandler({
      handler: (_request, _routeContext, context) => {
        order.push('handler');

        return Response.json(context);
      },
      middleware: [routeMiddleware],
    });

    // Act
    const response = await handler(
      createRequest('http://localhost/'),
      {},
      {
        source: 'request',
      },
    );

    // Assert
    await expect(response.json()).resolves.toEqual({
      defaultMiddlewareRan: true,
      routeMiddlewareRan: true,
      source: 'request',
    });

    expect(order).toEqual(['default', 'route', 'handler']);
  });

  it('When all request schemas accept their inputs, then the handler runs after validation', async () => {
    // Arrange
    const nextMiddleware = createMiddleware(async (_request, _routeContext, _context, next) => next());
    const middleware = jest.fn(nextMiddleware);
    const parseBody = jest.fn((input: unknown) => z.object({ name: z.string() }).parse(input));
    const parseHeaders = jest.fn((input: unknown) => z.object({ 'x-api-key': z.string() }).parse(input));
    const parseSearchParams = jest.fn((input: unknown) => z.object({ tag: z.array(z.string()) }).parse(input));
    const parseParams = jest.fn((input: unknown) => z.object({ id: z.string() }).parse(input));

    const handler = defineHandler({
      handler: (_request, _routeContext, context) => Response.json({ context, ok: true }),
      middleware: [middleware],
      validation: {
        body: { parse: parseBody },
        headers: { parse: parseHeaders },
        params: { parse: parseParams },
        searchParams: { parse: parseSearchParams },
      },
    });

    // Act
    const response = await handler(
      createRequest('http://localhost/items/42?tag=a&tag=b', {
        body: JSON.stringify({ name: 'example' }),
        headers: { 'content-type': 'application/json', 'x-api-key': 'secret' },
        method: 'POST',
      }),
      { params: Promise.resolve({ id: '42' }) },
      {},
    );

    // Assert
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ context: {}, ok: true });
    expect(parseBody).toHaveBeenCalledWith({ name: 'example' });
    expect(parseHeaders).toHaveBeenCalledWith(expect.objectContaining({ 'x-api-key': 'secret' }));
    expect(parseSearchParams).toHaveBeenCalledWith({ tag: ['a', 'b'] });
    expect(parseParams).toHaveBeenCalledWith({ id: '42' });
    expect(middleware).toHaveBeenCalledTimes(1);
  });

  it('When required request data is empty, then all schemas run and middleware is skipped on validation errors', async () => {
    // Arrange
    const nextMiddleware = createMiddleware(async (_request, _routeContext, _context, next) => next());
    const middleware = jest.fn(nextMiddleware);

    const parseBody = jest.fn((..._inputs: unknown[]) => {
      throw new ValidationError([{ message: 'Body is required', path: [] }]);
    });

    const bodySchema: Schema = { parse: parseBody };

    const parseHeaders = jest.fn((..._inputs: unknown[]) => {
      throw new ValidationError([{ message: 'Header is required', path: ['x-api-key'] }]);
    });

    const headersSchema: Schema = {
      parse: parseHeaders,
    };

    const parseSearchParams = jest.fn((..._inputs: unknown[]) => {
      throw new ValidationError([{ message: 'Query is required', path: ['q'] }]);
    });

    const searchParamsSchema: Schema = {
      parse: parseSearchParams,
    };

    const parseParams = jest.fn((..._inputs: unknown[]) => {
      throw new ValidationError([{ message: 'Params are required', path: [] }]);
    });

    const paramsSchema: Schema = {
      parse: parseParams,
    };

    const handler = defineHandler({
      handler: () => Response.json({ ok: true }),
      middleware: [middleware],
      validation: {
        body: bodySchema,
        headers: headersSchema,
        params: paramsSchema,
        searchParams: searchParamsSchema,
      },
    });

    // Act
    const response = await handler(createRequest('http://localhost/'), {}, {});

    // Assert
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toHaveLength(4);
    expect(parseBody).toHaveBeenCalledWith(undefined);
    expect(parseHeaders).toHaveBeenCalledWith({});
    expect(parseSearchParams).toHaveBeenCalledWith({});
    expect(parseParams).toHaveBeenCalledWith(undefined);
    expect(middleware).not.toHaveBeenCalled();
  });

  it('When a schema throws a compatible validation error, then the custom error response is returned', async () => {
    // Arrange
    const schema: Schema = {
      parse: () => {
        throw Object.assign(new Error('Invalid value'), {
          issues: [{ message: 'Invalid value', path: ['name'] }],
        });
      },
    };

    const handler = defineHandler({
      handler: () => Response.json({ ok: true }),
      onValidationError: errors => Response.json({ errors }, { status: 422 }),
      validation: {
        ...emptyValidation,
        body: schema,
      },
    });

    // Act
    const response = await handler(createRequest('http://localhost/', { body: '{}', method: 'POST' }), {}, {});

    // Assert
    expect(response.status).toBe(422);

    await expect(response.json()).resolves.toMatchObject({
      errors: [{ issues: [{ message: 'Invalid value', path: ['name'] }] }],
    });
  });
});
