import { type NextRequest } from 'next/server.js';
import { type Promisable } from 'type-fest';

// Need to keep as permissive as possible.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyMiddleware = Middleware<any, any, any>;

// Not required
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type AddedContext<T> = T extends Middleware<infer _P, infer _C, infer A> ? A : object;

// The other inferred parameters are intentionally unused when extracting prerequisites.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type RequiredContext<T> = T extends Middleware<infer _P, infer R, infer _A> ? R : object;

export type AccumulateContext<
  TContext extends object,
  TMiddleware extends readonly unknown[],
> = TMiddleware extends readonly [infer TFirst, ...infer TRest]
  ? AccumulateContext<TContext & AddedContext<TFirst>, TRest>
  : TContext;

export type MiddlewareChainIsValid<
  TContext extends object,
  TMiddleware extends readonly unknown[],
> = TMiddleware extends readonly [infer TFirst, ...infer TRest]
  ? TContext extends RequiredContext<TFirst>
    ? MiddlewareChainIsValid<TContext & AddedContext<TFirst>, TRest>
    : false
  : true;

export type MiddlewareChainConstraint<TContext extends object, TMiddleware extends readonly unknown[]> =
  MiddlewareChainIsValid<TContext, TMiddleware> extends true ? unknown : never;

export type DefinedHandler<TContext extends object, TParams> = (
  request: NextRequest,
  routeContext: RouteContext<TParams>,
  handlerContext: TContext,
) => Promise<Response>;

export type Handler<TContext extends object, TParams> = (
  request: NextRequest,
  routeContext: RouteContext<TParams>,
  context: TContext,
) => Promisable<Response>;

export type HandlerFactory<TContext extends object, TMiddleware extends readonly AnyMiddleware[]> = <
  TParams = Record<string, string>,
  const TRouteMiddleware extends readonly AnyMiddleware[] = [],
>(options: {
  handler: Handler<AccumulateContext<TContext, [...TMiddleware, ...TRouteMiddleware]>, TParams>;
  middleware?: TRouteMiddleware & MiddlewareChainConstraint<AccumulateContext<TContext, TMiddleware>, TRouteMiddleware>;
}) => DefinedHandler<TContext, TParams>;

export type Middleware<TParams, TRequiresContext extends object, TAddedContext extends object> = (
  request: NextRequest,
  routeContext: RouteContext<TParams>,
  context: TRequiresContext,
  next: Next<TAddedContext>,
) => Promisable<Response>;

export type NextOptions<TContext extends object> = {
  context: TContext;
};

export type Next<TAddedContext extends object = object> = (options?: { context?: TAddedContext }) => Promise<Response>;

export type RouteContext<TParams = Record<string, string>> = {
  params?: Promise<TParams>;
};

export interface Schema {
  parse(input: unknown): unknown;
}

export type ValidationType = 'body' | 'searchParams' | 'headers' | 'params';

export type Validation = Record<ValidationType, Schema | undefined>;
