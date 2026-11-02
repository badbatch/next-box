import { type NextRequest } from 'next/server.js';
import { createValidationError } from '#errors/ValidationError.ts';
import { type RouteContext, type Schema, type Validation } from '#types.ts';
import { type ValidateResult, type Validator } from '#validation/Validator.ts';

export class BodyValidator implements Validator {
  private readonly schema?: Schema;

  public constructor(validation: Validation) {
    if (validation.body) {
      this.schema = validation.body;
    }
  }

  public async validate(request: NextRequest, _routeContext: RouteContext): Promise<ValidateResult | undefined> {
    if (!this.schema) {
      return;
    }

    try {
      const content: unknown = request.body === null ? undefined : await request.json();
      await this.schema.parse(content);
      return [true];
    } catch (error: unknown) {
      return [false, createValidationError(error)];
    }
  }
}
