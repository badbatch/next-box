import { type NextRequest } from 'next/server.js';
import { createValidationError } from '#errors/ValidationError.ts';
import { type RouteContext, type Schema, type Validation } from '#types.ts';
import { type ValidateResult, type Validator } from '#validation/Validator.ts';

export class ParamsValidator implements Validator {
  private readonly schema?: Schema;

  public constructor(validation: Validation) {
    if (validation.params) {
      this.schema = validation.params;
    }
  }

  public async validate(_request: NextRequest, routeContext: RouteContext): Promise<ValidateResult | undefined> {
    const params = routeContext.params ? await routeContext.params : undefined;

    if (!this.schema) {
      return;
    }

    try {
      await this.schema.parse(params);
      return [true];
    } catch (error: unknown) {
      return [false, createValidationError(error)];
    }
  }
}
