import { type NextRequest } from 'next/server.js';
import { createValidationError } from '#errors/ValidationError.ts';
import { type RouteContext, type Schema, type Validation } from '#types.ts';
import { type ValidateResult, type Validator } from '#validation/Validator.ts';

export class HeadersValidator implements Validator {
  private readonly schema?: Schema;

  public constructor(validation: Validation) {
    if (validation.headers) {
      this.schema = validation.headers;
    }
  }

  public async validate(request: NextRequest, _routeContext: RouteContext): Promise<ValidateResult | undefined> {
    if (!this.schema) {
      return;
    }

    try {
      const headers = Object.fromEntries(request.headers.entries());
      await this.schema.parse(headers);
      return [true];
    } catch (error: unknown) {
      return [false, createValidationError(error)];
    }
  }
}
