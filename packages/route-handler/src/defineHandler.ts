import { StatusCodes } from 'http-status-codes';
import { type NextRequest, NextResponse } from 'next/server.js';
import { isFunction } from 'remeda';
import { type Promisable } from 'type-fest';
import { type ValidationError } from '#errors/ValidationError.ts';
import {
  type AccumulateContext,
  type Handler,
  type Middleware,
  type MiddlewareChainConstraint,
  type RouteContext,
  type Validation,
} from '#types.ts';
import { createRequestValidator } from '#validation/createRequestValidator.ts';

export type DefineHandlerOptions<
  TContext extends object,
  TParams,
  // Want to constrain the middleware’s general function shape, not its specific context types.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TMiddleware extends readonly Middleware<TParams, any, any>[],
> = {
  context?: TContext;
  handler: Handler<AccumulateContext<TContext, TMiddleware>, TParams>;
  middleware?: TMiddleware & MiddlewareChainConstraint<TContext, TMiddleware>;
  onValidationError?: (errors?: ValidationError[]) => Promisable<Response>;
  validation?: Validation;
};

export const defineHandler = <
  TContext extends object = object,
  TParams = Record<string, string>,
  // Want to constrain the middleware’s general function shape, not its specific context types.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const TMiddleware extends readonly Middleware<TParams, any, any>[] = [],
>({
  context,
  handler,
  // TypeScript workaround to handle the default value of middleware.
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  middleware = [] as unknown as TMiddleware & MiddlewareChainConstraint<TContext, TMiddleware>,
  onValidationError,
  validation,
}: DefineHandlerOptions<TContext, TParams, TMiddleware>) => {
  return async (
    request: NextRequest,
    routeContext: RouteContext<TParams>,
    handlerContext: TContext,
  ): Promise<Response> => {
    if (validation) {
      const requestValidator = createRequestValidator(validation);
      const [success, errors] = await requestValidator(request, routeContext);

      if (!success) {
        return isFunction(onValidationError)
          ? onValidationError(errors)
          : NextResponse.json(errors, { status: StatusCodes.BAD_REQUEST });
      }
    }

    const dispatch = async (index: number, accumContext: object): Promise<Response> => {
      if (index >= middleware.length) {
        // Required for typing accumulated context for consumer.
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        return handler(request, routeContext, accumContext as AccumulateContext<TContext, TMiddleware>);
      }

      const current = middleware[index];

      if (!current) {
        throw new Error(
          `No handler found for middleware at index ${String(index)}, please check middleware configuration.`,
        );
      }

      return current(request, routeContext, accumContext, async nextOptions => {
        // Due to permissive middleware typing above.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return dispatch(index + 1, {
          ...accumContext,
          ...nextOptions?.context,
        });
      });
    };

    return dispatch(0, { ...context, ...handlerContext });
  };
};
