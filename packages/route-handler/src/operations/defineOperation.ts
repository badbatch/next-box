import { createValidationError } from '#errors/ValidationError.ts';
import {
  type Operation,
  type OperationHandler,
  type OperationResult,
  type OperationSchema,
  type OperationValidationResult,
  ResultType,
} from '#operations/types.ts';

export type DefineOperationOptions<TInput, TContext extends object, TResult extends OperationResult> = {
  context: TContext;
  handler: OperationHandler<TInput, TContext, TResult>;
  validation: OperationSchema<TInput>;
};

export const defineOperation = <TInput, TContext extends object, TResult extends OperationResult>({
  context,
  handler,
  validation,
}: DefineOperationOptions<TInput, TContext, TResult>): Operation<TContext, TResult> => {
  return async ({ context: invocationContext, input }) => {
    let parsedInput: TInput;

    try {
      parsedInput = await validation.parse(input);
    } catch (error: unknown) {
      const result: OperationValidationResult = {
        errors: [createValidationError(error)],
        type: ResultType.ValidationError,
      };

      return result;
    }

    return handler({
      context: { ...context, ...invocationContext },
      input: parsedInput,
    });
  };
};
