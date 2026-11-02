import { type Middleware } from '#types.ts';

export const createMiddleware = <
  TParams = Record<string, string>,
  TRequiresContext extends object = object,
  TAddedContext extends object = object,
>(
  middleware: Middleware<TParams, TRequiresContext, TAddedContext>,
): Middleware<TParams, TRequiresContext, TAddedContext> => middleware;
