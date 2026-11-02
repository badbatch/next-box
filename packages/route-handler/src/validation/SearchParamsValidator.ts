import { type NextRequest } from 'next/server.js';
import { createValidationError } from '#errors/ValidationError.ts';
import { type Schema, type Validation } from '#types.ts';
import { type ValidateResult, type Validator } from '#validation/Validator.ts';

export class SearchParamsValidator implements Validator {
  private readonly schema?: Schema;

  public constructor(validation: Validation) {
    if (validation.searchParams) {
      this.schema = validation.searchParams;
    }
  }

  public async validate(request: NextRequest): Promise<ValidateResult | undefined> {
    if (!this.schema) {
      return;
    }

    try {
      const searchParams = [...new Set(request.nextUrl.searchParams.keys())].reduce<Record<string, string | string[]>>(
        (params, key) => {
          const values = request.nextUrl.searchParams.getAll(key);
          const [firstValue] = values;

          params[key] = values.length === 1 ? (firstValue ?? '') : values;

          return params;
        },
        {},
      );

      await this.schema.parse(searchParams);
      return [true];
    } catch (error: unknown) {
      return [false, createValidationError(error)];
    }
  }
}
