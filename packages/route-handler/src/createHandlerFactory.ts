import { defineHandler } from '#defineHandler.ts';
import {
  type AccumulateContext,
  type AnyMiddleware,
  type Handler,
  type HandlerFactory,
  type MiddlewareChainConstraint,
} from '#types.ts';

export type HandlerFactoryOptions<TContext extends object, TMiddleware extends readonly AnyMiddleware[]> = {
  context?: TContext;
  middleware?: TMiddleware & MiddlewareChainConstraint<TContext, TMiddleware>;
};

export const createHandlerFactory = <
  TContext extends object = object,
  const TMiddleware extends readonly AnyMiddleware[] = [],
>(
  defaults: HandlerFactoryOptions<TContext, TMiddleware>,
): HandlerFactory<TContext, TMiddleware> => {
  return <TParams = Record<string, string>, const TRouteMiddleware extends readonly AnyMiddleware[] = []>(options: {
    handler: Handler<AccumulateContext<TContext, [...TMiddleware, ...TRouteMiddleware]>, TParams>;
    middleware?: TRouteMiddleware &
      MiddlewareChainConstraint<AccumulateContext<TContext, TMiddleware>, TRouteMiddleware>;
  }) => {
    // Need to retain the tuple shape.
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const middleware = [...(defaults.middleware ?? []), ...(options.middleware ?? [])] as [
      ...TMiddleware,
      ...TRouteMiddleware,
    ];

    return defineHandler({
      context: defaults.context,
      handler: options.handler,
      // The defaults and route middleware chains are independently checked above and in HandlerFactory.
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      middleware: middleware as [...TMiddleware, ...TRouteMiddleware] &
        MiddlewareChainConstraint<TContext, [...TMiddleware, ...TRouteMiddleware]>,
    });
  };
};
