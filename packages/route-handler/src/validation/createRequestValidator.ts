import { type NextRequest } from 'next/server.ts';
import { type ValidationError } from '#errors/ValidationError.ts';
import { type RouteContext, type Validation } from '#types.ts';
import { BodyValidator } from '#validation/BodyValidator.ts';
import { HeadersValidator } from '#validation/HeadersValidator.ts';
import { ParamsValidator } from '#validation/ParamsValidator.ts';
import { SearchParamsValidator } from '#validation/SearchParamsValidator.ts';
import { type Validator } from '#validation/Validator.ts';

type ValidatorConstructor = new (validation: Validation) => Validator;

const validators: ValidatorConstructor[] = [BodyValidator, HeadersValidator, SearchParamsValidator, ParamsValidator];

export type RequestValidatorResult = [success: boolean, errors?: ValidationError[]];

export const createRequestValidator =
  (validation: Validation) =>
  async <TParams>(request: NextRequest, routeContext: RouteContext<TParams>): Promise<RequestValidatorResult> => {
    const errors: ValidationError[] = [];

    for (const Validator of validators) {
      const validator = new Validator(validation);
      const result = await validator.validate(request, routeContext);

      if (!result) {
        continue;
      }

      const [success, error] = result;

      if (success) {
        continue;
      }

      if (error) {
        errors.push(error);
      }
    }

    return [errors.length === 0, errors];
  };
