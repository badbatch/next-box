import { type Promisable } from 'type-fest';
import { type ValidationError } from '#errors/ValidationError.ts';

export const ResultType = {
  Conflict: 'Conflict',
  Created: 'Created',
  Failure: 'Failure',
  Forbidden: 'Forbidden',
  NoContent: 'NoContent',
  NotFound: 'NotFound',
  Success: 'Success',
  Unauthorized: 'Unauthorized',
  Unavailable: 'Unavailable',
  ValidationError: 'ValidationError',
} as const;

export type ResultType = (typeof ResultType)[keyof typeof ResultType];

export type OperationResult<TData = unknown> =
  | { data: TData; type: typeof ResultType.Success }
  | { data?: TData; type: typeof ResultType.Created }
  | { type: typeof ResultType.NoContent }
  | { errors: ValidationError[]; type: typeof ResultType.ValidationError }
  | {
      message?: string;
      type:
        | typeof ResultType.Conflict
        | typeof ResultType.Forbidden
        | typeof ResultType.NotFound
        | typeof ResultType.Unauthorized
        | typeof ResultType.Unavailable;
    }
  | { details?: unknown; message?: string; type: typeof ResultType.Failure };

export type OperationSchema<TOutput = unknown> = {
  parse(input: unknown): Promisable<TOutput>;
};

export type OperationValidationResult = {
  errors: ValidationError[];
  type: typeof ResultType.ValidationError;
};

export type Operation<TContext extends object, TResult extends OperationResult> = (options: {
  context?: Partial<TContext>;
  input: unknown;
}) => Promise<TResult | OperationValidationResult>;

export type OperationHandler<TInput, TContext extends object, TResult extends OperationResult> = (options: {
  context: TContext;
  input: TInput;
}) => Promisable<TResult>;
